<script setup>
import axios from "@axios";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {requiredValidator} from "@validators";
import CustomMapPicker from '@/components/map'
import {useMapStore} from "@/views/network/useMapStore";
import Combobox from "@/components/combobox.vue";

// Props
const props = defineProps({
  modelValue: Boolean,
  branchId: String,
  item: {
    type: Object,
    required: false,
    default: () => {
    },
  },
  separatePage: {
    type: Boolean,
    default: false,
  },
  dispatchers: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Composables
const {t} = useI18n();

// Variables
const dialogStatus = ref(props.modelValue);
const refForm = ref();
const receiver = ref({
  id: null,
  dispatch_id: props.branchId,
  name: null,
  type: null,
  capacity: null,
  capacity_used: null,
  address: null,
  ip: null,
  mac: null,
  username: null,
  password: null,
  customer_name: null,
  is_available: 1,
  lat: null,
  lng: null,
});

// Computed
const typeOptions = computed(()=>{
  return [
    {title: t('Public'),value: "public"},
    {title: t('Private'),value: "private"},
  ];
});

// Methods
const saveDataCenter = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      if (!props.separatePage) {
        useMapStore().saveReceiver(receiver.value)
            .then((dataCenter) => {
              dialogStatus.value = false;
            })
            .catch((err) => {
            })
      }else{
        emit("update:item", receiver.value);
      }

    }
  })
}

// Watchers
watch(() => props.modelValue, (val) => {
  dialogStatus.value = val;
})
watch(() => dialogStatus.value, (val) => {
  emit("update:modelValue", val);
})
watch(() => props.item, (val) => {
  // Fetch Data center
  axios.get('/map/receivers/get/' + props.item?.id)
      .then(res => {
        receiver.value = res.data.receiver;
        receiver.value.is_available = res.data.receiver.is_available===1;
      })
      .catch(err => {
      })
})

// LifeCycle Hooks
onMounted(() => {
  if (props.item?.id) {
    // Fetch Data center
    axios.get('/map/receivers/get/' + props.item?.id)
        .then(res => {
          receiver.value = res.data.receiver;
          receiver.value.is_available = res.data.receiver.is_available===1;
        })
        .catch(err => {
        })
  }
});
</script>

<template>
  <VDialog v-model="dialogStatus" width="700">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogStatus = !dialogStatus"/>
    <!-- Dialog Content -->
    <VCard :title="receiver.id?$t('Update receiver'):$t('Add receiver')">
      <VCardText>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--  Name -->
            <VCol cols="12" :md="dispatchers.length?6:12">
              <VTextField
                  v-model="receiver.name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  Dispatch -->
            <VCol md="6" cols="12" v-if="dispatchers.length">
              <Combobox
                  v-model="receiver.dispatch_id"
                  :items="dispatchers"
                  :label="$t('Dispatch')"
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '400' }"
                  persistent-hint
                  prepend-inner-icon="tabler-brightness-2"
              />
            </VCol>
            <!--  Type -->
            <VCol cols="12" :md="receiver.capacity_remaining!=null?12:6">
              <VSelect
                  v-model="receiver.type"
                  :items="typeOptions"
                  :label="$t('Type')"
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '400' }"
                  persistent-hint
                  prepend-inner-icon="tabler-brightness-2"
              />
            </VCol>
            <!--  Capacity -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="receiver.capacity"
                  :label="$t('Capacity')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-percentage-30"
              />
            </VCol>
            <!--  Remaining Capacity -->
            <VCol md="6" cols="12" v-if="receiver.capacity_remaining">
              <VTextField
                  v-model="receiver.capacity_remaining"
                  :label="$t('Remaining Capacity')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-percentage-80"
                  disabled
              />
            </VCol>
            <!--  Address -->
            <VCol cols="12">
              <VTextField
                  v-model="receiver.address"
                  :label="$t('Address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-map-pin"
              />
            </VCol>
            <!--  IP address -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="receiver.ip"
                  :label="$t('IP address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-dialpad"
              />
            </VCol>
            <!--  MAC address -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="receiver.mac"
                  :label="$t('MAC address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-dialpad"
              />
            </VCol>
            <!--  User name -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="receiver.username"
                  :label="$t('User name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-user"
              />
            </VCol>
            <!--  Password -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="receiver.password"
                  :label="$t('Password')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-password"
              />
            </VCol>
            <!--  Customer -->
            <VCol  cols="12">
              <VTextField
                  v-model="receiver.customer_name"
                  :label="$t('Customer')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-user"
              />
            </VCol>
<!--            &lt;!&ndash;  Is Available &ndash;&gt;-->
<!--            <VCol md="6" cols="12">-->
<!--              <VSwitch-->
<!--                  v-model="receiver.is_available"-->
<!--                  :label="$t('Is Available')"-->
<!--                  :rules="[requiredValidator]"-->
<!--                  prepend-inner-icon="tabler-user"-->
<!--              />-->
<!--            </VCol>-->
            <!--  Location -->
            <VCol  cols="12">
              <CustomMapPicker
                  v-model:lat="receiver.lat"
                  v-model:lng="receiver.lng"
              />
            </VCol>
            <!--  Actions -->
            <VCol md="6" cols="12">
              <div class="actions-container">

                <VBtn @click="saveDataCenter">
                  <VIcon
                      right
                      icon="tabler-device-floppy"
                  />
                  {{ $t('Save') }}
                </VBtn>
                <VBtn color="secondary" @click="dialogStatus=false;">
                  <VIcon
                      right
                      icon="tabler-trash"
                  />
                  {{ $t('Cancel') }}
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
.actions-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>