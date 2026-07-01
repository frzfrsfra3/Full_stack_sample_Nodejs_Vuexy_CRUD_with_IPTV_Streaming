<script setup>
import {useI18n} from "vue-i18n";
import {useIpTvStore} from "@/views/ipTv/useIpTvStore";
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import {regexValidator, requiredValidator} from "@validators";

// Stores
const ipTvStore = useIpTvStore();
const ipTvProfilesStore = useIpTvProfilesStore();
const {locale, t} = useI18n();
const router = useRouter()
const route = useRoute()

// Variables
const customer = ref({
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

// Methods
ipTvProfilesStore.fetchProfiles();
ipTvStore.fetchCustomerById(route.params.id).then((res) => {
  customer.value = res.data.tv
})

//  Submit Form
const onSubmit = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      // Check if the username is less than 12 characters
      if(customer.value.username.length<12){
        errorMessage.value = t('username_must_be_less_than_12_characters')
        errorSnackBar.value = true
        return
      }

      // Check if the username has @samTV.com suffix
      if(!customer.value.username.includes('@samTV.com')){
        errorMessage.value = t('username_must_have_suffix')
        errorSnackBar.value = true
        return
      }
      ipTvStore.updateCustomer(customer.value).then((res) => {
        successSnackBar.value = true
        setTimeout(() => {
          router.replace({name: 'ip-tv'})
        }, 2000)
      }).catch((err) => {
        errorMessage.value = err.response?.data?.message ?? t('Something bad happened, Please try again later.')
        errorSnackBar.value = true
        console.log(err)
      })
    }
  })
}
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="mb-5">
        <h2 class="text-h5">{{ $t('Update IPTV customer') }}</h2>
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
            />
          </VCol>
          <!--     Last Name       -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.last_name"
                :label="$t('Last Name')"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-user"
            />
          </VCol>
          <!--     User Name      -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.username"
                :label="$t('User name')"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-user"
            />
          </VCol>
          <!--     Phone       -->
          <VCol cols="12" md="6">
            <VTextField
                v-model="customer.phone_number"
                :label="$t('Phone')"
                :rules="[requiredValidator, regexValidator(customer.phone_number, '^[1-9]\\d{6,13}$')]"
                prepend-inner-icon="tabler-phone"
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
            />
          </VCol>
          <!--     MAC address       -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.mac_address"
                :label="$t('MAC address')"
                prepend-inner-icon="tabler-keyboard"
            />
          </VCol>
          <!--     Device number       -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.device_number"
                :label="$t('Device number')"
                prepend-inner-icon="tabler-device-desktop"
            />
          </VCol>
          <!--     Submit Button     -->
          <VCol md="12" class="d-flex justify-end">
            <VBtn
                color="primary"
                @click="onSubmit"
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

<style scoped lang="scss">

</style>
