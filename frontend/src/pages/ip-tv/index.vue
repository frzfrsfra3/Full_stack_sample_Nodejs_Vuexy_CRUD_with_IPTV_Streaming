<script setup>
import {useI18n} from "vue-i18n";
import {useIpTvStore} from "@/views/ipTv/useIpTvStore";
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {ca} from "vuetify/locale";
import {debounce} from "@/plugins/utils";

// Stores
const tvStore = useIpTvStore();
const ipTvProfilesStore = useIpTvProfilesStore();
const {t} = useI18n()

// Variables
const {customers, totalCustomers} = storeToRefs(tvStore)
const {profiles} = storeToRefs(ipTvProfilesStore)
const currentPage = ref(1)
const filters = ref({
  user_id: "",
  date_from: "",
  date_to: "",
  page: 1,
  page_size: 1000,
})
const totalPage = ref(0)
const debouncedGet = debounce(async () => {
  await fetchCustomers();
}, 500)

// Delete dialog
const deleteDialog = ref(false)
const tempCustomerID = ref(null)

// Methods
// Fetch Customers
const fetchCustomers = async () => {
  await tvStore.fetchCustomers(filters.value)
}
// ipTvProfilesStore.fetchProfiles().then(() => {
//   tvStore.fetchCustomers(filters.value)
// })

// Watchers
watch(() => filters.value, () => {
  debouncedGet();
}, {deep: true});
// watchEffect(() => {
//   tvStore.fetchCustomers(filters.value)
// })

//  Computing pagination data
const paginationData = computed(() => {
  const firstIndex = totalCustomers.value ? (filters.value.page - 1) * filters.value.page_size + 1 : 0
  const lastIndex = totalCustomers.value
      ? Math.min(filters.value.page * filters.value.page_size, totalCustomers.value)
      : 0

  return `Showing ${firstIndex} to ${lastIndex} of ${totalCustomers.value} entries`
})

//  Delete customer
const deleteCustomer = () => {
  tvStore.deleteCustomer(tempCustomerID.value)
  deleteDialog.value = false
}

//  Get Profile name by ID
const getProfileName = (id) => {
  const profile = profiles.value.find(profile => profile.id === id)
  return profile ? profile.title : 'Not Found!'
}

//  Get Activator name
const getActivatorName = (user) => {
  if (user.activated_by) {
    return user.activated_by.name + " " + user.activated_by.last_name
  } else {
    return t('Unknown')
  }
}

//  Get Status Color
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'cancel':
      return 'error'
    case 'expired':
      return 'info'
    case 'pending':
      return 'warning'
    case 'new':
      return 'primary'
    default:
      return 'grey'
  }
}

//  Watch Total Page
watchEffect(() => {
  totalPage.value = Math.ceil(totalCustomers.value / filters.value.page_size)
})

// LifeCycle Hooks
onMounted(()=>{
  ipTvProfilesStore.fetchProfiles()
      .then(()=>{
        fetchCustomers();
      })
})

</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="my-5 ">
        <div class="d-flex justify-space-between px-2">
          <h2 class="text-3xl">{{ $t('IPTV customers') }}</h2>
        </div>
      </VCardTitle>
      <VCardText class="d-flex align-center justify-end flex-wrap gap-4">
        <!--  Rows per page -->
        <div
            class="d-flex align-center"
        >
          <span class="text-no-wrap me-3">{{ $t('Show') }}:</span>
          <VSelect
              style="" class="d-block"
              v-model="filters.page_size"
              density="compact"
              :items="[10, 20, 30, 50,100,200,500,1000,2000,3000,4000,5000]"
          />
        </div>
        <VSpacer/>
        <!--  Search -->
        <div>
          <VTextField
              v-model="filters.q"
              :label="$t('Search...')"
              class="d-block"
              style="width: 15em;"
              dense
              solo
              clearable
              prepend-inner-icon="mdi-magnify"
          />
        </div>
      </VCardText>

      <VDivider/>
      <VDivider/>
      <VTable class="text-no-wrap">
        <!--  table head -->
        <thead>
        <tr>
          <th scope="col">
            {{ $t('Full name') }}
          </th>

          <th scope="col">
            {{ $t('User name') }}
          </th>

          <th scope="col">
            {{ $t('Activator name') }}
          </th>

          <th scope="col">
            {{ $t('Branch') }}
          </th>

          <th scope="col">
            {{ $t('Profile') }}
          </th>

          <th scope="col">
            {{ $t('Expiration Date') }}
          </th>

          <th scope="col">
            {{ $t('Status') }}
          </th>
          <th scope="col">
            {{ $t('Actions') }}
          </th>
        </tr>
        </thead>
        <!--  table body -->
        <tbody>
        <tr
            v-for="user in customers"
            :key="user.id"
        >
          <!--  Full name -->
          <td>
            {{ user.first_name + " " + user.last_name }}
          </td>

          <!--  User name -->
          <td>
            {{ user.username }}
          </td>

          <!--  Activator Name -->
          <td>
            {{ getActivatorName(user) }}
          </td>

          <!--  Branch -->
          <td>
            {{ user.activated_by?.branch?.name ?? $t('Unknown') }}
          </td>

          <!--  Profile -->
          <td>
            {{ getProfileName(user.profile_id) }}
          </td>

          <!--  Profile Expiration Date -->
          <td>
            {{ user.expired_date }}
          </td>

          <!--  Status -->
          <td>

            <VChip
                label
                :color="getStatusColor(user.activate_status_exp)"
                size="small"
                class="text-capitalize me-2"
            >
              {{ $t(user.activate_status_exp) }}
            </VChip>
          </td>

          <!--  Actions -->
          <td>
            <VBtn
                icon
                variant="text"
                color="default"
                size="x-small"
                :disabled="!$can('tvs.update', 'Sam')&&!$can('tvs.activate', 'Sam')&&
                !$can('tvs.delete', 'Sam')"
            >
              <VIcon
                  :size="22"
                  icon="tabler-dots-vertical"
              />
              <VMenu activator="parent">
                <VList>
                  <VListItem :to="{ name: 'ip-tv-activate-id', params: { id: user.id } }"
                             v-if="$can('tvs.activate', 'Sam')">
                    <template #prepend>
                      <VIcon
                          size="24"
                          class="me-3"
                          icon="tabler-receipt"
                      />
                    </template>

                    <VListItemTitle>{{ $t('Activate customer') }}</VListItemTitle>
                  </VListItem>
                  <VListItem :to="{ name: 'ip-tv-edit-id', params: { id: user.id } }"
                             v-if="$can('tvs.update', 'Sam')">
                    <template #prepend>
                      <VIcon
                          size="24"
                          class="me-3"
                          icon="tabler-pencil"
                      />
                    </template>

                    <VListItemTitle>{{ $t('Edit') }}</VListItemTitle>
                  </VListItem>
                  <VListItem value="duplicate" @click="deleteDialog=true;tempCustomerID=user.id"
                             v-if="$can('tvs.delete', 'Sam')">
                    <template #prepend>
                      <VIcon
                          size="24"
                          class="me-3"
                          icon="tabler-trash-x"
                      />
                    </template>

                    <VListItemTitle>{{ $t('Delete') }}</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </VBtn>
          </td>
        </tr>
        </tbody>

        <!--  table footer  -->
        <tfoot v-show="!customers.length">
        <tr>
          <td
              colspan="7"
              class="text-center"
          >
            No data available
          </td>
        </tr>
        </tfoot>
      </VTable>
      <VDivider/>

      <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
            <span class="text-sm text-disabled">
              {{ paginationData }}
            </span>

        <VPagination
            v-model="filters.page"
            size="small"
            :total-visible="5"
            :length="totalPage"
        />
      </VCardText>
    </VCard>
    <VDialog
        v-model="deleteDialog"
        width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="deleteDialog = !deleteDialog"/>

      <!-- Dialog Content -->
      <VCard :title="$t('Are you sure?')">
        <VCardText>
          {{ $t('Are you sure you want to delete this customer?') }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">

          <VBtn @click="deleteDialog = false; tempCustomerID.value=0" color="secondary">
            {{ $t('No') }}
          </VBtn>
          <VBtn @click="deleteCustomer" color="error">
            {{ $t('Yes') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>


</template>

<style scoped lang="scss">

</style>
