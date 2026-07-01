<script setup>
import {lengthValidator, regexValidator, requiredValidator} from "@validators";
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import {useIpTvStore} from "@/views/ipTv/useIpTvStore";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";


// Stores
const ipTvStore = useIpTvStore();
const ipTvProfilesStore = useIpTvProfilesStore();
const {locale, t} = useI18n();
const router = useRouter()

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


const generalSettings = JSON.parse(localStorage.getItem('generalSettings'));
const iptv_password_length = generalSettings?.iptv_password_length ?? 8
const iptv_password_type = generalSettings?.iptv_password_type ?? 'manual'
//if password type is auto, generate random password which is iptv_password_length characters long and display it in the password field and disable it
const isPasswordDisabled = computed(() => iptv_password_type === "auto");
if (iptv_password_type === 'auto') {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < iptv_password_length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  customer.value.password = result

}


// Methods
ipTvProfilesStore.getProfilesForActivation();

//  Generate Username
const generateUsername = () => {
  if (customer.value.phone_number.length > 4) {
    // Clear old username
    customer.value.username = ''
    // Get current time stamp in seconds
    let currentTimeStamp = Math.floor(Date.now() / 1000).toString()
    // Remove first 5 characters from time stamp
    currentTimeStamp = currentTimeStamp.slice(5)
    // get last 4 digits of phone number
    let last4Digits = customer.value.phone_number.slice(-4)
    // Generate username
    customer.value.username = `${last4Digits}${currentTimeStamp}samtv`
  } else {
    errorMessage.value = t('Phone number must be at least 5 digits')
    errorSnackBar.value = true
  }
}

//  Submit Form
const onSubmit = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      // Check if the username is less than 12 characters
      if (customer.value.username.length < 12) {
        errorMessage.value = t('username must be at least 12 characters')
        errorSnackBar.value = true
        return
      }


      ipTvStore.createCustomer(customer.value).then((res) => {
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
        <h2 class="text-h5">{{ $t('Add IPTV customer') }}</h2>
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
                disabled
                dir="ltr"
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
                @blur="generateUsername"
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
                id="iptv_password"
                :disabled="isPasswordDisabled"
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
              {{ $t('Add new customer') }}
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
      {{ $t('Customer Added Successfully') }}
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

<!-- @formatter:off -->

<!--  @formatter:on -->