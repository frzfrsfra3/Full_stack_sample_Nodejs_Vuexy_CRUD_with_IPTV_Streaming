<script setup>
import axios from "@axios";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {requiredValidator} from "@validators";
import CustomMapPicker from '@/components/map'
import {useMapStore} from "@/views/network/useMapStore";


// Props
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
const dataCenter = ref({
  id: null,
  branch_id: props.branchId,
  name: null,
  address: null,
  city: null,
  lat: null,
  lng: null,
});

// Methods
const saveDataCenter = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      useMapStore().saveDataCenter(dataCenter.value)
          .then((dataCenter) => {
            dialogStatus.value = false;
          })
          .catch((err) => {
          })
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
  axios.get('/map/data-centers/get/' + props.item?.id)
      .then(res => {
        dataCenter.value = res.data.dataCenter;
      })
      .catch(err => {
      })
})
// LifeCycle Hooks
onMounted(() => {
  if (props.item?.id) {
    // Fetch Data center
    axios.get('/map/data-centers/get/' + props.item?.id)
        .then(res => {
          dataCenter.value = res.data.dataCenter;
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
    <VCard :title="dataCenter.id?$t('Update data center'):$t('Add data center')">
      <VCardText>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--  Name -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dataCenter.name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  City -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dataCenter.city"
                  :label="$t('City')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-building-skyscraper"
              />
            </VCol>
            <!--  Address -->
            <VCol cols="12">
              <VTextField
                  v-model="dataCenter.address"
                  :label="$t('Address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-map-pins"
              />
            </VCol>
            <!--  Location -->
            <VCol cols="12">
              <CustomMapPicker
                  v-model:lat="dataCenter.lat"
                  v-model:lng="dataCenter.lng"
              />
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