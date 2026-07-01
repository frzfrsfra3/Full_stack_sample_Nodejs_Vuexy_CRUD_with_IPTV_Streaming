<script setup>
import axios from "@axios";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {integerValidator, requiredValidator} from "@validators";
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
  oltPorts:{
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
const splitter = ref({
  id: null,
  dispatch_id: props.branchId,
  name: null,
  address: null,
  capacity: null,
  lat: null,
  lng: null,
  // ports: [],
});

// Methods
const saveDataCenter = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      useMapStore().saveSplitter(splitter.value)
          .then((dataCenter) => {
            dialogStatus.value = false;
          })
          .catch((err) => {
          })
    }
  })


}
const addPort = ()=>{
  splitter.value.ports.push({
    port_number:null,
    is_available:false,
  });
}
const removePortItem = (item)=>{
  const index = splitter.value.ports.indexOf(item);
  if(index > -1){
    splitter.value.ports.splice(index, 1);
  }
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
  axios.get('/map/splitters/get/' + props.item?.id)
      .then(res => {
        splitter.value = res.data.splitter;
      })
      .catch(err => {
      })
})

// LifeCycle Hooks
onMounted(() => {
  if (props.item?.id) {
    // Fetch Data center
    axios.get('/map/splitters/get/' + props.item?.id)
        .then(res => {
          splitter.value = res.data.splitter;
          // debugger;
          for (let i = 0; i < splitter.value.ports.length; i++) {
            const port = splitter.value.ports[i];

            port.is_available = port.is_available===1;
          }
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
    <VCard :title="splitter.id?$t('Update splitter'):$t('Add splitter')">
      <VCardText>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--  Name -->
            <VCol cols="12">
              <VTextField
                  v-model="splitter.name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  Source Port -->
            <VCol md="6" cols="12">
              <Combobox
                  v-model="splitter.source_port_id"
                  :items="oltPorts"
                  :label="$t('Source Port')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-brand-tabler"
              />
            </VCol>
            <!--  Capacity -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="splitter.capacity"
                  :label="$t('Capacity')"
                  :rules="[requiredValidator,integerValidator]"
                  prepend-inner-icon="tabler-percentage-30"
              />
            </VCol>
            <!--  Address -->
            <VCol cols="12">
              <VTextField
                  v-model="splitter.address"
                  :label="$t('Address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-map-pin"
              />
            </VCol>
            <!--  Location -->
            <VCol cols="12">
              <CustomMapPicker
                  v-model:lat="splitter.lat"
                  v-model:lng="splitter.lng"
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