<script setup>
import {useI18n} from "vue-i18n";
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {debounce} from "@/plugins/utils";


// Stores
const ipTvProfilesStore = useIpTvProfilesStore();
const {t} = useI18n()

// Variables
const {profiles, totalProfiles} = storeToRefs(ipTvProfilesStore)
const currentPage = ref(1)
const filters = ref({
  user_id: "",
  date_from: "",
  date_to: "",
  page: 1,
  page_size: 10,
})
const successSnackBar = ref(false)
const errorSnackBar = ref(false)
const errorMessage = ref('')
const debouncedGet = debounce(async () => {
  await fetchProfiles();
}, 500)

// Delete dialog
const deleteDialog = ref(false)
const tempProfileID = ref(null)

// Methods
const fetchProfiles = async () => {
  await ipTvProfilesStore.fetchProfiles(filters.value);
};

// Watchers
watch(() => filters.value, () => {
  debouncedGet();
}, {deep: true});


//  Computing pagination data
const paginationData = computed(() => {
  const firstIndex = totalProfiles.value ? (filters.value.page - 1) * filters.value.page_size + 1 : 0
  const lastIndex = totalProfiles.value
      ? Math.min(filters.value.page * filters.value.page_size, totalProfiles.value)
      : 0

  return `Showing ${firstIndex} to ${lastIndex} of ${totalProfiles.value} entries`
})

//  Delete profile
const deleteProfile = () => {
  ipTvProfilesStore.deleteProfile(tempProfileID.value)
      .then(res=>{
        successSnackBar.value = true;
      })
      .catch(err=>{
        errorMessage.value = err.response?.data?.message ?? t('Something bad happened, Please try again later.')
        errorSnackBar.value = true
      })
  deleteDialog.value = false
}


// LifeCycle Hooks
onMounted(()=>{
  fetchProfiles();
});
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="my-5 ">
        <div class="d-flex justify-space-between px-2">
          <h2 class="text-3xl">{{ $t('IPTV profiles') }}</h2>
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
            {{ $t('Profile title') }}
          </th>
          <th scope="col">
            {{ $t('Profile type') }}
          </th>
          <th scope="col">
            {{ $t('Days') }}
          </th>
          <th scope="col">
            {{ $t('Price') }}
          </th>
          <th scope="col">
            {{ $t('Actions') }}
          </th>
        </tr>
        </thead>
        <!--  table body -->
        <tbody>
        <tr
            v-for="user in profiles"
            :key="user.id"
        >
          <!--  Title -->
          <td>
            {{ user.title }}
          </td>
          <!--  Type -->
          <td>
            {{ user.profile_type }}
          </td>

          <!--  Days -->
          <td>
            {{ user.days }}
          </td>

          <!--  Price -->
          <td>
            <p class="mb-0">
              {{ user.price_usd }}
              <VIcon
                  size="20"
                  icon="tabler-currency-dollar"
              />
            </p>
          </td>

          <!--  Actions -->
          <td>
            <VBtn
                icon
                variant="text"
                color="default"
                size="x-small"
                :disabled="!$can('tv_profiles.update', 'Sam')&&!$can('tv_profiles.delete', 'Sam')"
            >
              <VIcon
                  :size="22"
                  icon="tabler-dots-vertical"
              />
              <VMenu activator="parent">
                <VList>
                  <VListItem :to="{ name: 'ip-tv-profiles-edit-id', params: { id: user.id } }"
                             v-if="$can('tv_profiles.update', 'Sam')">
                    <template #prepend>
                      <VIcon
                          size="24"
                          class="me-3"
                          icon="tabler-pencil"
                      />
                    </template>

                    <VListItemTitle>{{ $t('Edit') }}</VListItemTitle>
                  </VListItem>
                  <VListItem value="duplicate" @click="deleteDialog=true;tempProfileID=user.id"
                             v-if="$can('tv_profiles.delete', 'Sam')">
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
        <tfoot v-show="!profiles.length">
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
            :length="totalProfiles.value"
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
          {{ $t('Are you sure you want to delete this profile?') }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">

          <VBtn @click="deleteDialog = false; tempProfileID=0" color="secondary">
            {{ $t('No') }}
          </VBtn>
          <VBtn @click="deleteProfile" color="error">
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
      {{ $t('Profile deleted successfully') }}
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
  </div>
</template>

<style scoped lang="scss">

</style>
