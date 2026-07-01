<script setup>
import {useI18n} from "vue-i18n";
import {useIpTvStore} from "@/views/ipTv/useIpTvStore";
import {useIpTvProfilesStore} from "@/views/ipTvProfiles/useIpTvProfilesStore";
import {betweenValidator, regexValidator, requiredValidator} from "@validators";
import {useCustomerStore} from "@/views/customer/useCustomerStore";
import ConfirmDialog from "@core/components/ConfirmDialog.vue";

// Stores
const ipTvStore = useIpTvStore();
const ipTvProfilesStore = useIpTvProfilesStore();
const customerStore = useCustomerStore()
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
const {isActivationAPICalling} = storeToRefs(ipTvStore)
const successSnackBar = ref(false)
const errorSnackBar = ref(false)
const errorMessage = ref('')
const refForm = ref();
const financeData = ref({
  profileMaxPrice: 0,
  profileMinPrice: 0,
  pricingType: null,
  wakeedDollar: null,
  wakeedTL: null,
  canActivateWithoutBalance: 0,
})
const isLoading = ref(false)
const exchangeRates = ref({
  tl: 0,
  sp: 0,
})
const accountTypeItems = ref([])
const requestPayload = ref({
  id: route.params.id,
  profile_id: null,
  payment_currency: null,
  user_price: null,
})
const confirmDialog = ref(false)

const profilePricePlaceholder = computed(() => {
  switch (requestPayload.value.payment_currency) {
    case 'tl':
      return t('Profile price in TL')
    case 'usd':
      return t('Profile price in USD')
    case 'sp':
      return t('Profile price in SP')
  }
})
const profilePriceIcon = computed(() => {
  switch (requestPayload.value.payment_currency) {
    case 'tl':
      return 'tabler-currency-lira'
    case 'usd':
      return 'tabler-currency-dollar'
    case 'sp':
      return 'tabler-brand-mastercard'
  }
})

// Methods
isLoading.value = true
ipTvProfilesStore.fetchProfiles();
ipTvStore.fetchCustomerById(route.params.id).then((res) => {
  customer.value = res.data.tv
  financeData.value = res.data.user_infos

  const arr = res.data.user_infos.finance_currency_account_type_array || []
  // Rebuild items in one go
  accountTypeItems.value = arr.map(item => ({ title: t(item), value: item }))

  // Auto-select when only one option exists
  if (arr.length === 1) {
    requestPayload.value.payment_currency = arr[0]
  }

  financeData.value.wakeedDollar = res.data.wakeed_dollar_account
  financeData.value.wakeedTL = res.data.wakeed_tl_account
  financeData.value.wakeedSP = res.data.wakeed_sp_account
  financeData.value.pricingType = res.data.user_infos.pricing_type
  financeData.value.canActivateWithoutBalance = res.data.user_infos.can_add_customers_with_out_balance !== 0

  // Assign the default value of the account type to the requestPayload
  if(res.data.wakeed_dollar_account){
    requestPayload.value.payment_currency = 'usd'
  }
  if(res.data.wakeed_tl_account){
    requestPayload.value.payment_currency = 'tl'
  }

  if(res.data.wakeed_sp_account){
    requestPayload.value.payment_currency = 'sp'
  }

  isLoading.value = false
})

// Get customer full name
const getCustomerFullName = computed(() => {
  return customer.value.first_name + ' ' + customer.value.last_name
})

// Get Account Balance as computed
const getBalance = computed(() => {
  if (requestPayload.value.payment_currency === 'usd') {
    return financeData.value.wakeedDollar.balance
  }
  if (requestPayload.value.payment_currency === 'tl') {
    return financeData.value.wakeedTL.balance
  }
  if (requestPayload.value.payment_currency === 'sp') {
    return financeData.value.wakeedSP.balance
  }
})

// On Profile selection change
const onProfileChange = (val) => {
  if (!requestPayload.value.payment_currency) {
    errorMessage.value = t('Please select account type first')
    errorSnackBar.value = true
    return
  }

  // Set the Profile price is USD
  if (requestPayload.value.payment_currency === 'usd') {
    requestPayload.value.user_price = Number(profiles.value.find(e => e.id === val).price_usd)
  }
  // Set the Profile price in TL
  if (requestPayload.value.payment_currency === 'tl') {
    let dollarPrice = Number(profiles.value.find(e => e.id === val).price_usd)
    requestPayload.value.user_price = dollarPrice * exchangeRates.value.tl
  }
  // Set the Profile price in SP
  if (requestPayload.value.payment_currency === 'sp') {
    let dollarPrice = Number(profiles.value.find(e => e.id === val).price_usd)
    requestPayload.value.user_price = dollarPrice * exchangeRates.value.sp
  }


  requestPayload.value.user_price = Math.round(requestPayload.value.user_price);
  // Update Min and Max Price
  financeData.value.profileMaxPrice = Number(requestPayload.value.user_price) + requestPayload.value.user_price * (financeData.value.max_percent / 100)
  financeData.value.profileMinPrice = Number(requestPayload.value.user_price) - requestPayload.value.user_price * (financeData.value.min_percent / 100)
}

// Watch over the requestPayload.payment_currency
watch(
    () => requestPayload.value.payment_currency, // Accessing specific property
    (newVal, oldVal) => {
      console.log('Old Value:', oldVal);
      console.log('New Value:', newVal);

      // Out if no price is set
      if (!requestPayload.value.user_price) {
        return;
      }

      // Calculate the new price
      onProfileChange(requestPayload.value.profile_id);
    }
);

//  Get Exchange Rate
customerStore.getExchangeRate().then(res => {
  // exchangeRate.value = res.data.bulletin[0].equivalent
  // loop over all objects in res.data.bulletin and get the equivalent from the object which has currencyID=903186b1-e6f5-4c2e-a5ad-90335a9f9805
  res.data.bulletin.map((item) => {
    if (item.currencyID === res.data.tl_currency_id) {
      exchangeRates.value.tl = item.equivalent
    }
  })
  // Syrian Pound
  res.data.bulletin.map((item) => {
    if (item.currencyID === res.data.sp_currency_id) {
      exchangeRates.value.sp = item.equivalent
    }
  })
})

//  Update dialog
const updateDialog = (val) => {
  confirmDialog.value = val
}

//  Submit Form
const submitForm = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      // Check if the user has balance
      if (getBalance.value < requestPayload.value.user_price && financeData.value.canActivateWithoutBalance !== 1) {
        errorMessage.value = t('You do not have enough balance to activate this customer')
        return
      }
      confirmDialog.value = true
    } else {
      errorMessage.value = t('Please fill all required fields')
      errorSnackBar.value = true
    }
  })
}

//  Prevent the user from going back or reload the page while the request is being processed
const preventBack = (event) => {
  if (isActivationAPICalling.value) {
    event.preventDefault();
    event.returnValue = ''; // Standard to prevent the unload
    return ''; // For older browsers
  }
}

//  Submit Form
const onSubmit = () => {
  confirmDialog.value = false
  refForm.value.validate().then((res) => {
    if (res.valid) {
      // Add a JS event for preventing the user from going back or reload the page while the request is being processed
      window.addEventListener('beforeunload', preventBack)
      ipTvStore.activateCustomer(requestPayload.value).then((res) => {
        // Remove the JS event for preventing the user from going back or reload the page while the request is being processed
        window.removeEventListener('beforeunload', preventBack)
        successSnackBar.value = true
        setTimeout(() => {
          router.replace({name: 'ip-tv'})
        }, 2000)
      }).catch((err) => {
        // Remove the JS event for preventing the user from going back or reload the page while the request is being processed
        window.removeEventListener('beforeunload', preventBack)
        errorMessage.value = err.response?.data?.message ?? t('Something bad happened, Please try again later.')
        errorSnackBar.value = true
        console.log(err)
      })
    }
  })
}

onBeforeRouteLeave((to, from, next) => {
  if (isActivationAPICalling.value) {
    alert(t('An API call is still in progress. Do you really want to leave?'))
    next(false);
  } else {
    next();
  }
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="mb-5">
        <h2 class="text-h5">{{ $t('Activate IPTV customer') }}</h2>
      </VCardTitle>
      <VForm ref="refForm"
             @submit.prevent="() => {}">
        <VRow>
          <!--     Customer full name     -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="getCustomerFullName"
                disabled="disabled"
                :label="$t('Full name')"
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
                prepend-inner-icon="tabler-user"
            />
          </VCol>
          <!--     Expiration Date     -->
          <VCol cols="12" md="4">
            <VTextField
                v-model="customer.expired_date"
                disabled="disabled"
                :label="$t('Package expiration date')"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-calendar"
            />
          </VCol>
          <!--     Profile and financial data     -->
          <VCol cols="12" v-if="!isLoading">
            <VRow>
              <!--     Account Type     -->
              <VCol cols="12" :md="6">
                <VSelect
                    :disabled="financeData.finance_currency_account_type_array.length<2"
                    v-model="requestPayload.payment_currency"
                    :items="accountTypeItems"
                    :menu-props="{ maxHeight: '400' }"
                    :label="$t('Account type')"
                    prepend-inner-icon="tabler-premium-rights"
                    :rules="[requiredValidator]"
                    persistent-hint
                />
              </VCol>
              <!--     Balance     -->
              <VCol cols="12" :md="6">
                <VTextField
                    v-model="getBalance"
                    disabled="disabled"
                    :label="$t('Balance')"
                    :rules="[requiredValidator]"
                    prepend-inner-icon="tabler-cash"
                />
              </VCol>
              <!--     Select profile     -->
              <VCol cols="12" :md="6">
                <VSelect
                    @update:modelValue="onProfileChange"
                    v-model="requestPayload.profile_id"
                    :label="$t('Profile')"
                    :items="profiles"
                    item-text="title"
                    item-value="id"
                    :rules="[requiredValidator]"
                    prepend-inner-icon="tabler-affiliate"
                />
              </VCol>
              <!--     Profile Price     -->
              <VCol cols="12" :md="6">
                <VTextField
                    :disabled="financeData.pricing_type === 'amount'"
                    v-if="financeData.pricingType === 'amount'"
                    v-model="requestPayload.user_price"
                    :label="profilePricePlaceholder"
                    :rules="[requiredValidator]"
                    :prepend-inner-icon="profilePriceIcon"
                />
                <VTextField
                    v-if="financeData.pricing_type !== 'amount'"
                    v-model="requestPayload.user_price"
                    :label="profilePricePlaceholder"
                    :rules="[requiredValidator,betweenValidator(requestPayload.user_price, financeData.profileMinPrice, financeData.profileMaxPrice)]"
                    :prepend-inner-icon="profilePriceIcon"
                />
              </VCol>
            </VRow>
          </VCol>
          <!--     Submit Button     -->
          <VCol md="12" class="d-flex justify-end">
            <VBtn
                color="primary"
                :disabled="financeData.wakeedDollar === null"
                @click="submitForm"
            >
              <VIcon
                  start
                  icon="tabler-user-plus"
              />
              {{ $t('Activate customer') }}
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
      {{ $t('Customer Activated Successfully') }}
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
    <!-- Confirm Dialog -->
    <ConfirmDialog :is-dialog-visible="confirmDialog"
                   :confirmation-msg="$t('Selected package will be activated, Are you sure?')"
                   @confirm="onSubmit" @update:isDialogVisible="updateDialog"/>
  </VCard>
</template>

<style scoped lang="scss">

</style>

