<script setup>
import axios from "@axios";


// Props
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {requiredValidator} from "@validators";
import CustomMapPicker from '@/components/map'
import {useMapStore} from "@/views/network/useMapStore";
import Combobox from "@/components/combobox.vue";

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

const showTowerSelect = computed(() => props.separatePage && props.towers.length > 0);

// Variables
const dialogStatus = ref(props.modelValue);
const refForm = ref();
const dispatch = ref({
  id: null,
  tower_id: props.branchId,
  name: null,
  ssid: null,
  pass_ssid: null,
  ip: null,
  mac: null,
  lat: null,
  lng: null,
  username: null,
  password: null,
  frequency: null,
});

// Methods
const saveDispatch = () => {
  refForm.value.validate().then((res) => {
    if (res.valid) {
      if (!props.separatePage) {
        useMapStore().saveDispatch(dispatch.value)
            .then(() => {
              dialogStatus.value = false;
            })
            .catch(() => {
            })
      } else {
        emit('update:item', dispatch.value);
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
watch(() => props.item, () => {
  if (!props.item?.id) return
  axios.get('/map/dispatches/get/' + props.item.id)
      .then(res => {
        dispatch.value = res.data.dispatch;
      })
      .catch(() => {
      })
})

watch(() => props.towers, (list) => {
  if (!props.item?.id && props.separatePage && list?.length && (dispatch.value.tower_id == null || dispatch.value.tower_id === '')) {
    dispatch.value.tower_id = list[0].value
  }
}, {immediate: true})

// LifeCycle Hooks
onMounted(() => {
  if (props.item?.id) {
    axios.get('/map/dispatches/get/' + props.item?.id)
        .then(res => {
          dispatch.value = res.data.dispatch;
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
    <VCard :title="dispatch.id?$t('Update dispatch'):$t('Add dispatch')">
      <VCardText>
        <VForm ref="refForm"
               @submit.prevent="() => {}">
          <VRow>
            <!--  Name -->
            <VCol cols="12" :md="showTowerSelect ? 6 : 12">
              <VTextField
                  v-model="dispatch.name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-align-box-center-middle"
              />
            </VCol>
            <!--  Tower (standalone page) -->
            <VCol md="6" cols="12" v-if="showTowerSelect">
              <Combobox
                  v-model="dispatch.tower_id"
                  :items="towers"
                  :label="$t('Tower')"
                  :rules="[requiredValidator]"
                  :menu-props="{ maxHeight: '400' }"
                  persistent-hint
                  prepend-inner-icon="tabler-building-broadcast-tower"
              />
            </VCol>
            <!--  Capacity (nullable on store) -->
            <VCol :md="6" cols="12">
              <VTextField
                  v-model="dispatch.capacity"
                  :label="$t('Capacity')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-brightness-2"
              />
            </VCol>
            <!--  Remaining Capacity -->
            <VCol md="6" cols="12" v-if="dispatch.capacity_remaining">
              <VTextField
                  v-model="dispatch.capacity_remaining"
                  :label="$t('Remaining Capacity')"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-brightness-2"
                  disabled
              />
            </VCol>
            <!--  Frequency (nullable on store) -->
            <VCol cols="12" :md="dispatch.capacity_remaining?12:6">
              <VTextField
                  v-model="dispatch.frequency"
                  :label="$t('Frequency')"
                  prepend-inner-icon="tabler-ripple"
              />
            </VCol>
            <!--  IP -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dispatch.ip"
                  :label="$t('IP address')"
                  prepend-inner-icon="tabler-dialpad"
              />
            </VCol>
            <!--  MAC -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dispatch.mac"
                  :label="$t('MAC address')"
                  prepend-inner-icon="tabler-dialpad"
              />
            </VCol>
            <!--  SSID -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dispatch.ssid"
                  :label="$t('SSID')"
                  prepend-inner-icon="tabler-wifi"
              />
            </VCol>
            <!--  SSID Password -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dispatch.pass_ssid"
                  :label="$t('SSID password')"
                  prepend-inner-icon="tabler-password"
              />
            </VCol>
            <!--  User name -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dispatch.username"
                  :label="$t('User name')"
                  prepend-inner-icon="tabler-user"
              />
            </VCol>
            <!--  Password -->
            <VCol md="6" cols="12">
              <VTextField
                  v-model="dispatch.password"
                  :label="$t('Password')"
                  prepend-inner-icon="tabler-password"
              />
            </VCol>
            <!--  Location -->
            <VCol cols="12">
              <CustomMapPicker
                  v-model:lat="dispatch.lat"
                  v-model:lng="dispatch.lng"
              />
            </VCol>
            <!--  Actions -->
            <VCol cols="12">
              <div class="actions-container">

                <VBtn @click="saveDispatch">
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