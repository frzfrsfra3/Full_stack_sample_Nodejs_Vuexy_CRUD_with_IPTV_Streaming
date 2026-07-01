<script setup>
import axios from "@axios";


// Props
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {integerValidator, requiredValidator} from "@validators";
import CustomMapPicker from '@/components/map'
import {useMapStore} from "@/views/network/useMapStore";

const props = defineProps({
  modelValue: Boolean,
  branchId: String,
  item: {
    type: Object,
    required: false,
    default: () => {
    },
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Variables
const dialogStatus = ref(props.modelValue);
const refForm = ref();
const olt = ref({
  id: null,
  data_center_id: props.branchId,
  name: null,
  capacity: null,
  ip_address: null,
  mac_address: null,
  lat: null,
  lng: null,
  ports:[],
});

// Methods
const saveDataCenter = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      useMapStore().saveOLT(olt.value)
          .then((dataCenter) => {
            dialogStatus.value = false;
          })
          .catch((err) => {
          })
    }
  })
}
const addPort = ()=>{
  if(!olt.value.ports){
    olt.value.ports = [];
  }
  olt.value.ports.push({
    port_number:null,
    capacity:null,
  });
}
const removePortItem = (item)=>{
  const index = olt.value.ports.indexOf(item);
  if(index > -1){
    olt.value.ports.splice(index, 1);
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
  axios.get('/map/olts/get/' + props.item?.id)
      .then(res => {
        olt.value = res.data.olt	;
      })
      .catch(err => {
      })
})

// LifeCycle Hooks
onMounted(() => {
  if (props.item?.id) {
    // Fetch Data center
    axios.get('/map/olts/get/' + props.item?.id)
        .then(res => {
          olt.value = res.data.olt	;
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
    <VCard :title="olt.id?$t('Update OLT'):$t('Add OLT')">
      <VCardText>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--  Name -->
            <VCol cols="12">
              <VTextField
                  v-model="olt.name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  Capacity -->
            <VCol cols="12" :md="olt.capacity_remaining?6:12">
              <VTextField
                  v-model="olt.capacity"
                  :label="$t('Capacity')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-brightness-2"
              />
            </VCol>
            <!--  Remaining Capacity -->
            <VCol md="6" cols="12" v-if="olt.capacity_remaining">
              <VTextField
                  v-model="olt.capacity_remaining"
                  :label="$t('Remaining Capacity')"
                  prepend-inner-icon="tabler-brightness-2"
                  disabled
              />
            </VCol>
            <!--  IP -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="olt.ip_address"
                  :label="$t('IP address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-dialpad"
              />
            </VCol>
            <!--  MAC -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="olt.mac_address"
                  :label="$t('MAC address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-dialpad"
              />
            </VCol>
            <VCol cols="12" class="pb-0">
              <VDivider/>
            </VCol>
            <VCol cols="12" class="pb-0">
              <h2>{{ $t('Ports') }}:</h2>
            </VCol>
            <!--  IP ports -->
            <VCol cols="12">
              <VRow class="mt-0 mb-2" v-for="item in olt.ports" :key="'port-'+item.id">
                <!--  Port -->
                <VCol md="5" cols="12">
                  <VTextField
                      v-model="item.port_number"
                      :label="$t('Port Number')"
                      :rules="[requiredValidator]"
                      prepend-inner-icon="tabler-number"
                  />
                </VCol>
                <!--  Is Available -->
                <VCol md="5" cols="12">
                  <VTextField
                      v-model="item.capacity"
                      :label="$t('Capacity')"
                      :rules="[requiredValidator, integerValidator]"
                      prepend-inner-icon="tabler-number"
                  />
                </VCol>
                <VCol md="2" cols="12">
                  <VBtn icon="tabler-trash" color="error" variant="outlined" @click="removePortItem(item)"/>
                </VCol>
                <VDivider/>
              </VRow>
              <VRow class="justify-end mt-0 mb-0">
                <VBtn color="primary" variant="outlined" @click="addPort">
                  <VIcon icon="tabler-plus"/>
                  {{$t('Add')}}
                </VBtn>
              </VRow>
            </VCol>
            <VCol cols="12">
              <VDivider/>
            </VCol>
            <!--  Actions -->
            <VCol cols="12">
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