<script setup>


// Props
import {useMapStore} from "@/views/network/useMapStore";
import {computed, ref} from "vue";
import DialogCloseBtn from "@core/components/DialogCloseBtn.vue";
import {useAbility} from "@casl/vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(['delete:item','update:item']);

// Stores
const mapStore = useMapStore();
const { can } = useAbility();

// Variables
const deleteDialogStatus = ref(false);
const canEditInMap = computed(() => can('maps.edit_in_map', 'Sam'));
const canDeleteInMap = computed(() => can('maps.delete_in_map', 'Sam'));


// Methods
const getItemIcon = (type) => {
  switch (type) {
    case 'branch': {
      return "tabler-map-star";
    }
    case 'data-center': {
      return "tabler-server-2";
    }
    case 'tower': {
      return "tabler-building-lighthouse";
    }
    case 'dispatch': {
      return "tabler-router";
    }
    case 'receiver': {
      return "tabler-router";
    }
    case 'box': {
      return "tabler-box";
    }
    case 'olt': {
      return "tabler-plug-connected";
    }
    case 'splitter_a': {
      return "tabler-reserved-line";
    }
    default: {
      return "tabler-upload";
    }
  }
};
const onItemClicked = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (props.item.type !== 'box') {
    mapStore.drillDownTo(props.item.id, props.item.type);
  }
}
const openDeleteDialog = (e)=>{
  e.preventDefault();
  e.stopPropagation();
  deleteDialogStatus.value=true;
};
const deleteItem = ()=>{
  mapStore.deleteItem(props.item.id,props.item.type);
};
const editItem = (e)=>{
  if (props.item.type !== 'branch' && canEditInMap.value) {
    e.preventDefault();
    e.stopPropagation();
    emit("update:item",props.item.id,props.item.type);
  }

}
</script>

<template>
  <div class="map-list-item" :class="[{'not-clickable':item.type==='box'}]" @click="onItemClicked">
    <div class="avatar-container">
      <VAvatar
        variant="tonal"
        color="primary"
        :class="[{ 'edit-enabled': item.type !== 'branch' && canEditInMap }]"
        @click="editItem"
      >
        <VIcon :icon="getItemIcon(item.type)"/>
      </VAvatar>
    </div>
    <div class="title-container">
      <p>{{ item.name }}</p>
    </div>
    <div class="actions-container" v-if="item.type!=='branch' && canDeleteInMap">
      <VBtn size="sm" variant="text" icon="tabler-trash" @click="openDeleteDialog"/>
    </div>
    <VDialog
        v-model="deleteDialogStatus"
        width="500"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="deleteDialogStatus = !deleteDialogStatus"/>

      <!-- Dialog Content -->
      <VCard :title="$t('Are you sure?')">
        <VCardText>
          {{ $t('Are you sure you want to delete this item? This action is irreversible') }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">

          <VBtn @click="deleteDialogStatus = false;" color="secondary">
            {{ $t('No') }}
          </VBtn>
          <VBtn @click="deleteItem" color="error">
            {{ $t('Yes') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped lang="scss">
.map-list-item {
  display: flex;
  align-items: center;
  padding-block: 0.5em;
  padding-inline: 0.5em;
  column-gap: 0.5em;
  cursor: pointer;
  transition: 0.35s ease;
  border-bottom: 1px solid #e4e4e4;
  z-index: 1;

  &:last-of-type {
    border-bottom: none;
  }

  &.not-clickable {
    cursor: auto;
  }

  &:hover:not(.not-clickable) {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    background-color: rgba(var(--v-theme-primary), 0.02);
    z-index: 2;
  }

  .avatar-container {
    .edit-enabled {
      cursor: pointer;
    }
  }

  .title-container {
    flex: 1;
    text-align: center;

    p {
      margin-bottom: 0;
      user-select: none;
    }
  }
}
</style>