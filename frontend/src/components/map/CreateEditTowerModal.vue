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
  separatePage: {
    type: Boolean,
    default: false,
  },
  dataCenters: {
    type: Array,
    default: () => [],
  },
});

// Store
const mapStore = useMapStore();

// Emits
const emit = defineEmits(['update:modelValue', 'update:item']);

// Variables
const dialogStatus = ref(props.modelValue);
const refForm = ref();
const {admins} = storeToRefs(mapStore)
/** Combobox requires an array; mapStore.admins can be empty before /map/helper finishes. */
const dataCenterItems = computed(() => (Array.isArray(props.dataCenters) ? props.dataCenters : []))
const supervisorItems = computed(() => (Array.isArray(admins.value) ? admins.value : []))
const showDataCenterField = computed(() => props.separatePage || dataCenterItems.value.length > 0)
const tower = ref({
  id: null,
  data_center_id: props.branchId,
  name: null,
  address: null,
  high: null,
  supervisor_id: null,
  lat: null,
  lng: null,
});

// Methods
const saveDataCenter = () => {
  refForm.value.validate().then((res) => {
    if (res.valid && tower.value.lat != null) {
      if (!props.separatePage) {
        useMapStore().saveTower(tower.value)
            .then((dataCenter) => {
              dialogStatus.value = false;
            })
            .catch((err) => {
            })
      } else {
        emit("update:item", tower.value);
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
  axios.get('/map/towers/get/' + props.item?.id)
      .then(res => {
        tower.value = res.data.tower;
      })
      .catch(err => {
      })
})

// LifeCycle Hooks
onMounted(() => {
  if (props.item?.id) {
    // Fetch Data center
    axios.get('/map/towers/get/' + props.item?.id)
        .then(res => {
          tower.value = res.data.tower;
          tower.value.supervisor_id = tower.value.supervisor_id.toString();
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
    <VCard :title="tower.id?$t('Update tower'):$t('Add tower')">
      <VCardText>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--  Name -->
            <VCol cols="12" :md="showDataCenterField ? 6 : 12">
              <VTextField
                  v-model="tower.name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  Data Centers -->
            <VCol cols="6" v-if="showDataCenterField">
              <Combobox
                  v-model="tower.data_center_id"
                  :items="dataCenterItems"
                  :label="$t('Data center')"
                  item-title="title"
                  item-value="value"
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '400' }"
                  persistent-hint
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  Address -->
            <VCol cols="12">
              <VTextField
                  v-model="tower.address"
                  :label="$t('Address')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-map-pins"
              />
            </VCol>
            <!--  High -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="tower.high"
                  :label="$t('Tower High')"
                  :rules="[requiredValidator,integerValidator]"
                  prepend-inner-icon="tabler-arrow-merge-alt-right"
              />
            </VCol>
            <!--  Supervisor -->
            <VCol md="6" cols="12" class="d-flex align-center">
              <Combobox
                  v-model="tower.supervisor_id"
                  :items="supervisorItems"
                  :label="$t('Supervisor')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-user-exclamation"
              />
            </VCol>
            <!--  Location -->
            <VCol cols="12">
              <CustomMapPicker
                  v-model:lat="tower.lat"
                  v-model:lng="tower.lng"
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