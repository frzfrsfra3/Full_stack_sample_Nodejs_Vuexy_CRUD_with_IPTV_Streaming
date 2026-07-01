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
  towers: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['update:modelValue', 'update:item']);

const { t } = useI18n()

const showStandaloneLinkFields = computed(() => props.separatePage)

const towerRequiredRule = () => (v) => {
  if (v != null && v !== '') return true
  return t('Select a tower')
}

// Variables
const dialogStatus = ref(props.modelValue);
const refForm = ref();
const box = ref({
  id: null,
  receiver_id: props.branchId,
  tower_id: null,
  name: null,
  capacity: null,
  capacity_used: null,
  added_by: null,
  address: null,
  lat: null,
  lng: null,
});

/** Receivers for the selected tower (standalone list page). */
const receiversForTower = ref([])
const loadingReceivers = ref(false)

const loadReceiversForTower = (towerId) => {
  receiversForTower.value = []
  if (towerId == null || towerId === '') return
  loadingReceivers.value = true
  axios.post('/map/receivers/list', {
    page: 1,
    per_page: 1000,
    q: null,
    tower_id: towerId,
  })
      .then(res => {
        const list = res.data.receivers?.data ?? []
        receiversForTower.value = list.map(r => ({value: r.id, title: r.name}))
      })
      .catch(() => {
        receiversForTower.value = []
      })
      .finally(() => {
        loadingReceivers.value = false
      })
}

const onTowerFieldUpdated = (val) => {
  box.value.tower_id = val
  box.value.receiver_id = null
  loadReceiversForTower(val)
}

const saveBox = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      if (!props.separatePage) {
        useMapStore().saveBox(box.value)
            .then(() => {
              dialogStatus.value = false;
            })
            .catch(() => {
            })
      } else {
        emit('update:item', box.value);
      }
    }
  })
}

const hydrateReceiversAfterLoad = () => {
  if (props.separatePage && box.value.tower_id != null && box.value.tower_id !== '') {
    loadReceiversForTower(box.value.tower_id)
  }
}

// Watchers
watch(() => props.modelValue, (val) => {
  dialogStatus.value = val;
})
watch(() => dialogStatus.value, (val) => {
  emit("update:modelValue", val);
})
watch(() => props.item, () => {
  if (!props.item?.id) return
  axios.get('/map/boxes/get/' + props.item.id)
      .then(res => {
        box.value = res.data.box;
        hydrateReceiversAfterLoad()
      })
      .catch(() => {
      })
})

// LifeCycle Hooks
onMounted(() => {
  if (props.item?.id) {
    axios.get('/map/boxes/get/' + props.item.id)
        .then(res => {
          box.value = res.data.box;
          hydrateReceiversAfterLoad()
        })
        .catch(() => {
        })
  }
});
</script>

<template>
  <VDialog v-model="dialogStatus" width="700">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogStatus = !dialogStatus"/>
    <!-- Dialog Content -->
    <VCard :title="box.id?$t('Update box'):$t('Add box')">
      <VCardText>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--  Name -->
            <VCol cols="12">
              <VTextField
                  v-model="box.name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  Tower then optional Receiver (standalone list) -->
            <VCol md="6" cols="12" v-if="showStandaloneLinkFields">
              <Combobox
                  :model-value="box.tower_id"
                  :items="towers"
                  :label="$t('Tower')"
                  :rules="[towerRequiredRule()]"
                  :menu-props="{ maxHeight: '400' }"
                  persistent-hint
                  prepend-inner-icon="tabler-building-broadcast-tower"
                  clearable
                  @update:model-value="onTowerFieldUpdated"
              />
            </VCol>
            <VCol md="6" cols="12" v-if="showStandaloneLinkFields">
              <Combobox
                  v-model="box.receiver_id"
                  :items="receiversForTower"
                  :label="$t('receiver')"
                  :hint="$t('Optional — pick a receiver under this tower')"
                  :disabled="box.tower_id == null || box.tower_id === ''"
                  :loading="loadingReceivers"
                  :menu-props="{ maxHeight: '400' }"
                  persistent-hint
                  prepend-inner-icon="tabler-router"
                  clearable
              />
            </VCol>
            <!--  Address -->
            <VCol cols="12">
              <VTextField
                  v-model="box.address"
                  :label="$t('Address')"
                  prepend-inner-icon="tabler-map-pin"
              />
            </VCol>
            <!--  Capacity (nullable|integer on API) -->
            <VCol cols="12" :md="box.capacity_remaining!=null?6:12">
              <VTextField
                  v-model="box.capacity"
                  :label="$t('Capacity')"
                  :rules="[integerValidator]"
                  prepend-inner-icon="tabler-percentage-30"
              />
            </VCol>
            <!--  Remaining Capacity -->
            <VCol md="6" cols="12" v-if="box.capacity_remaining!=null">
              <VTextField
                  v-model="box.capacity_remaining"
                  :label="$t('Remaining Capacity')"
                  prepend-inner-icon="tabler-percentage-80"
                  disabled
              />
            </VCol>
            <!--  Location -->
            <VCol cols="12">
              <CustomMapPicker
                  v-model:lat="box.lat"
                  v-model:lng="box.lng"
              />
            </VCol>
            <!--  Actions -->
            <VCol cols="12">
              <div class="actions-container">

                <VBtn @click="saveBox">
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
