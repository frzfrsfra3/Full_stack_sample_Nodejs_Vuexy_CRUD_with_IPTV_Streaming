<script setup>
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import {useIpTvStore} from "@/views/ipTv/useIpTvStore";
import {regexValidator, requiredValidator} from "@validators";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";


// Stores
const ipTvStore = useIpTvStore();
const ipTvProfilesStore = useIpTvProfilesStore();
const {locale, t} = useI18n();
const router = useRouter()
const route = useRoute()

// Variables
const customer = ref({
  id: route.params.id,
  first_name: "",
  last_name: "",
  username: "",
  password: "",
  phone_number: "",
  profile_id: null,
  mac_address: "",
  device_number: "",
  status: 1,
});
const {profiles} = storeToRefs(ipTvProfilesStore)
const successSnackBar = ref(false)
const errorSnackBar = ref(false)
const errorMessage = ref('')
const refForm = ref();
const confirmDialog = ref(false)
const statusItems = ref([
  {title: t('Active'), value: "active"},
  {title: t('Cancel'), value: "cancel"},
  {title: t('Pending'), value: "pending"},
])
const requestPayload = ref({
  id: route.params.id,
  status: null
})

// Methods
ipTvProfilesStore.fetchProfiles();
ipTvStore.fetchCustomerById(route.params.id).then((res) => {
  customer.value = res.data.tv
})

//  Update customer status
const updateCustomerStatus = () => {
  confirmDialog.value = false
  ipTvStore.updateCustomerStatus(requestPayload.value)
      .then(res=>{
        successSnackBar.value = true
        setTimeout(() => {
          router.replace({name: 'ip-tv-filtered-pending'})
        }, 1500)
      })
      .catch(err=>{
        errorMessage.value = err.response?.data?.message ?? t('Something bad happened, Please try again later.')
        errorSnackBar.value = true
      })
}
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="mb-5">
        <h2 class="text-h5">{{ $t('Update IPTV customer status') }}</h2>
      </VCardTitle>
      <VForm ref="refForm"
             @submit.prevent="() => {}">
        <VRow>
          <!--     First Name       -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.first_name"
                :label="$t('First Name')"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-user"
                disabled
            />
          </VCol>
          <!--     Last Name       -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.last_name"
                :label="$t('Last Name')"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-user"
                disabled
            />
          </VCol>
          <!--     User Name      -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.username"
                :label="$t('User name')"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-user"
                disabled
            />
          </VCol>
          <!--     Phone       -->
          <VCol cols="12" md="6">
            <VTextField
                v-model="customer.phone_number"
                :label="$t('Phone')"
                :rules="[requiredValidator, regexValidator(customer.phone_number, '^[1-9]\\d{6,13}$')]"
                prepend-inner-icon="tabler-phone"
                disabled
            />
          </VCol>
          <!--     Password       -->
          <VCol cols="12" md="6">
            <VTextField
                v-model="customer.password"
                :label="$t('Password')"
                :rules="[requiredValidator]"
                type="text"
                prepend-inner-icon="tabler-password"
                disabled
            />
          </VCol>
          <!--     Profile       -->
          <VCol cols="12" md="4">
            <VSelect
                v-model="customer.profile_id"
                :label="$t('Profile')"
                :items="profiles"
                item-text="title"
                item-value="id"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-affiliate"
                disabled
            />
          </VCol>
          <!--     MAC address       -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.mac_address"
                :label="$t('MAC address')"
                prepend-inner-icon="tabler-keyboard"
                disabled
            />
          </VCol>
          <!--     Device number       -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.device_number"
                :label="$t('Device number')"
                prepend-inner-icon="tabler-device-desktop"
                disabled
            />
          </VCol>
          <!--     Submit Button     -->
          <VCol md="12" class="d-flex justify-end">
            <VBtn
                color="primary"
                :disabled="!customer.username"
                @click="confirmDialog = true"
            >
              <VIcon
                  start
                  icon="tabler-user-plus"
              />
              {{ $t('Update customer') }}
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardItem>
    <!-- Confirm Dialog -->
    <VDialog
        v-model="confirmDialog"
        width="500"
        persistent>
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="confirmDialog = !confirmDialog"/>

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

          <VBtn @click="confirmDialog = false" color="secondary">
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
  </VCard>
</template>

<style lang="scss">

</style>

