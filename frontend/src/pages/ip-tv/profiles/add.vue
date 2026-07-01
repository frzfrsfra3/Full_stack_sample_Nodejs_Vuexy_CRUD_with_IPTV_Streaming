<script setup>
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import {integerValidator, requiredValidator} from "@validators";

// Stores
const ipTvProfilesStore = useIpTvProfilesStore();
const {t} = useI18n()
const router = useRouter()

// Variables
const profile = ref({
  title: "",
  profile_type: "",
  days: "",
  price_usd: "",
})
const refForm = ref(null)
const successSnackBar = ref(false)
const errorSnackBar = ref(false)
const errorMessage = ref('')

// Methods

//  Submit Form
const onSubmit = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      ipTvProfilesStore.storeProfile(profile.value).then((res) => {
        successSnackBar.value = true
        // Navigate after 1 second
        setTimeout(() => {
          router.push({name: 'ip-tv-profiles'})
        }, 1000)
      }).catch((err) => {
        errorMessage.value = err.response?.data?.message ?? t('Something bad happened, Please try again later.')
        errorSnackBar.value = true
      })
    }
  })
}
</script>

<template>
    <VCard>
      <VCardItem>
        <VCardTitle class="mb-5">
          <h2 class="text-h5">{{ $t('Add IPTV profile') }}</h2>
        </VCardTitle>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--     Profile Title      -->
            <VCol cols="12" md="6">
              <VTextField
                  v-model="profile.title"
                  :label="$t('Profile title')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-letter-case-toggle"
              />
            </VCol>
            <!--     Profile Type      -->
            <VCol cols="12" md="6">
              <VTextField
                  v-model="profile.profile_type"
                  :label="$t('Profile type')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-star"
              />
            </VCol>
            <!--     Profile Duration      -->
            <VCol cols="12" md="6">
              <VTextField
                  v-model="profile.days"
                  :label="$t('Profile duration in days')"
                  :rules="[requiredValidator, integerValidator]"
                  prepend-inner-icon="tabler-clock-hour-1"
              />
            </VCol>
            <!--     Profile Price      -->
            <VCol cols="12" md="6">
              <VTextField
                  v-model="profile.price_usd"
                  :label="$t('Profile price in dollar')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-currency-dollar"
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
                    icon="tabler-layout-grid-add"
                />
                {{ $t('Add new profile') }}
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
        {{ $t('Profile Added Successfully') }}
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

