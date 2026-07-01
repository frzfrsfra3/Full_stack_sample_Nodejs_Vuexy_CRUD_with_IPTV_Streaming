<script setup>
import {useIpTvStore} from "@/views/ipTv/useIpTvStore";
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import {useI18n} from "vue-i18n";
import {requiredValidator} from "@validators";
import Combobox from "@/components/combobox.vue";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {debounce} from "@/plugins/utils";

// Stores
const tvStore = useIpTvStore();
const ipTvProfilesStore = useIpTvProfilesStore();
const {t} = useI18n()

// Variables
const {pendingCustomers, totalPendingCustomers} = storeToRefs(tvStore)
const {profiles} = storeToRefs(ipTvProfilesStore)
const currentPage = ref(1)
const totalPage = ref(0)
const filters = ref({
  q: "",
  page: 1,
  page_size: 10,
})
const confirmationDialog = ref(false)
const requestPayload = ref({
  id: null,
  status: null
})
const statusItems = ref([
  {title: t('Active'), value: "active"},
  {title: t('Cancel'), value: "cancel"},
  {title: t('Pending'), value: "pending"},
])
const successSnackBar = ref(false)
const errorSnackBar = ref(false)
const errorMessage = ref('')
const debouncedGet = debounce(async () => {
  await fetchPendingCustomers();
}, 500)

// Methods
// Fetch Pending Customers
const fetchPendingCustomers = async () => {
  await tvStore.fetchPendingCustomers(filters.value)
};

// Watchers
watch(() => filters.value, () => {
  debouncedGet();
}, {deep: true});

//  Computing pagination data
const paginationData = computed(() => {
  const firstIndex = totalPendingCustomers.value ? (filters.value.page - 1) * filters.value.page_size + 1 : 0
  const lastIndex = totalPendingCustomers.value
      ? Math.min(filters.value.page * filters.value.page_size, totalPendingCustomers.value)
      : 0

  return `Showing ${firstIndex} to ${lastIndex} of ${totalPendingCustomers.value} entries`
})

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

const updateCustomerStatus = () => {
  confirmationDialog.value = false
  tvStore.updateCustomerStatus(requestPayload.value)
      .then(res => {
        successSnackBar.value = true
        setTimeout(() => {
          router.replace({name: 'ip-tv-filtered-pending'})
        }, 1500)

        tvStore.fetchPendingCustomers(filters.value);
      })
      .catch(err => {
        errorMessage.value = err.response?.data?.message ?? t('Something bad happened, Please try again later.')
        errorSnackBar.value = true
      })
}

//  Watch Total Page
watchEffect(() => {
  totalPage.value = Math.ceil(totalPendingCustomers.value / filters.value.page_size)
})

// LifeCycle Hooks
onMounted(() => {
  ipTvProfilesStore.fetchProfiles()
      .then(() => {
        fetchPendingCustomers();
      })
});
</script>

<template>
  <section>
    <VCard>
      <VCardTitle class="my-5 ">
        <div class="d-flex justify-space-between px-2">
          <h2 class="text-3xl">{{ $t('Pending IPTV customers') }}</h2>
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
              :items="[10, 20, 30, 50]"
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
            {{ $t('Password') }}
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
            v-for="user in pendingCustomers"
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

          <!--  Password -->
          <td>
            {{ user.password }}
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
                :color="user.status === 1 ? 'success' : 'warning'"
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
                :disabled="!$can('tvs.activate_or_cancel', 'Sam')"
            >
              <VIcon
                  :size="22"
                  icon="tabler-dots-vertical"
              />
              <VMenu activator="parent">
                <VList>
                  <VListItem @click="confirmationDialog = true; requestPayload.id = user.id"
                             v-if="$can('tvs.activate_or_cancel', 'Sam')" class="cursor-pointer">
                    <template #prepend>
                      <VIcon
                          size="24"
                          class="me-3"
                          icon="tabler-pencil"
                      />
                    </template>

                    <VListItemTitle>{{ $t('Update Status') }}</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </VBtn>
          </td>
        </tr>
        </tbody>

        <!--  table footer  -->
        <tfoot v-show="!pendingCustomers.length">
        <tr>
          <td
              colspan="7"
              class="text-center"
          >
            {{ $t('No data available') }}
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
        v-model="confirmationDialog"
        width="600"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="confirmationDialog = !confirmationDialog"/>

      <!-- Dialog Content -->
      <VCard :title="$t('Update IPTV customer status')">
        <VCardText>
          <VSelect
              v-model="requestPayload.status"
              :label="$t('Status')"
              :items="statusItems"
              :rules="[requiredValidator]"
              prepend-inner-icon="tabler-affiliate"
          />
        </VCardText>
        <VCardText class="d-flex justify-end gap-3">

          <VBtn @click="confirmationDialog = false" color="secondary">
            {{ $t('No') }}
          </VBtn>
          <VBtn @click="updateCustomerStatus" color="error">
            {{ $t('Yes') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <!-- Success Message -->
    <VSnackbar
        v-model="successSnackBar"
        location="bottom end"
        variant="flat"
        color="success"
    >
      {{ $t('Customer Updated Successfully') }}
    </VSnackbar>
    <!-- Error Message -->
    <VSnackbar
        v-model="errorSnackBar"
        location="bottom end"
        variant="flat"
        color="error"
    >
      {{ errorMessage }}
    </VSnackbar>
  </section>
</template>

<style scoped lang="scss">

</style>
