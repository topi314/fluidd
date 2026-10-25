<template>
  <app-dialog
    v-model="open"
    :title="$t('app.general.title.add_camera_tile')"
    max-width="420"
    :save-button-text="$t('app.general.btn.add')"
    @save="handleSave"
  >
    <v-card-text>
      <v-select
        v-model="config.cameraUid"
        :items="cameras"
        item-text="name"
        item-value="uid"
        filled
        hide-details="auto"
        :label="$tc('app.general.title.camera', 1)"
        :rules="[
          $rules.required
        ]"
      />
    </v-card-text>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel } from 'vue-property-decorator'
import type { CameraCardConfig } from '@/store/layout/types'
import StateMixin from '@/mixins/state'

@Component({})
export default class CameraCardConfigDialog extends Mixins(StateMixin) {
  @VModel({ type: Boolean })
  open?: boolean

  @Prop({ type: Object, required: true })
  readonly config!: CameraCardConfig

  get cameras (): Array<{ uid: string, name: string }> {
    const webcams: Moonraker.Webcam.Entry[] = this.$typedGetters['webcams/getEnabledWebcams']

    return [
      {
        uid: 'all',
        name: this.$t('app.general.btn.all').toString()
      },
      ...webcams.map(webcam => ({
        uid: webcam.uid,
        name: webcam.name || webcam.uid
      }))
    ]
  }

  handleSave () {
    this.$emit('save', this.config)
    this.open = false
  }
}
</script>
