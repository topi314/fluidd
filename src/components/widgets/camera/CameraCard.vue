<template>
  <collapsable-card
    :title="title"
    icon="$camera"
    :lazy="false"
    draggable
    :layout-path="layoutPath"
    @collapsed="collapsed = $event"
  >
    <template
      v-if="isInstance"
      #layout-actions
    >
      <app-btn
        icon
        small
        :aria-label="$t('app.general.btn.remove')"
        @mousedown.stop
        @click.stop="handleDelete"
      >
        <v-icon small>
          $delete
        </v-icon>
      </app-btn>
    </template>

    <template
      v-if="!isInstance"
      #menu
    >
      <camera-menu @select="handleCameraSelect" />
    </template>

    <v-row
      v-if="!collapsed && cameras.length > 1"
      justify="space-around"
      class="ma-2"
    >
      <v-col
        v-for="camera in cameras"
        :key="camera.uid"
        cols="12"
        :sm="cols"
      >
        <camera-item :camera="camera" />
      </v-col>
    </v-row>

    <camera-item
      v-else-if="!collapsed && cameras.length === 1"
      :camera="cameras[0]"
    />

    <v-card-text
      v-else-if="!collapsed"
      class="text-center"
    >
      {{ $t('app.general.msg.camera_missing') }}
    </v-card-text>
  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import CameraItem from '@/components/widgets/camera/CameraItem.vue'
import CameraMenu from './CameraMenu.vue'
import StateMixin from '@/mixins/state'
import {
  type CameraCardConfig,
  type LayoutConfig,
  isCameraCardConfig
} from '@/store/layout/types'

@Component({
  components: {
    CameraItem,
    CameraMenu
  }
})
export default class CameraCard extends Mixins(StateMixin) {
  @Prop({ type: Object })
  readonly config?: LayoutConfig

  collapsed = false

  get isInstance (): boolean {
    return this.config != null && isCameraCardConfig(this.config)
  }

  get selectedWebcam (): string | undefined {
    return this.isInstance && this.config && isCameraCardConfig(this.config)
      ? this.config.cameraUid
      : undefined
  }

  get layoutPath (): string {
    return `dashboard.${this.config?.id ?? 'camera-card'}`
  }

  get cols () {
    if (this.cameras.length <= 2) return 6
    return 4
  }

  get title (): string {
    const uid = this.selectedWebcam
    if (uid && uid !== 'all') {
      const camera: Moonraker.Webcam.Entry | undefined =
        this.$typedGetters['webcams/getWebcamById'](uid)
      if (camera?.name) return camera.name
    }

    return this.$tc('app.general.title.camera', 2).toString()
  }

  get cameras (): Moonraker.Webcam.Entry[] {
    const uid = this.selectedWebcam

    if (uid == null) {
      return this.$typedGetters['webcams/getVisibleWebcams']
    }

    if (uid === 'all') {
      return this.$typedGetters['webcams/getEnabledWebcams']
    }

    const camera: Moonraker.Webcam.Entry | undefined =
      this.$typedGetters['webcams/getWebcamById'](uid)

    return camera?.enabled ? [camera] : []
  }

  handleCameraSelect (id: string) {
    const config = this.config

    if (config && isCameraCardConfig(config)) {
      const name: string = this.$typedGetters['layout/getSpecificLayoutName']
      const value: CameraCardConfig = {
        ...config,
        cameraUid: id
      }
      this.$typedDispatch('layout/onUpdateConfig', { name, value })
      return
    }

    this.$typedDispatch('webcams/updateActiveWebcam', id)
  }

  handleDelete () {
    if (this.config) {
      this.$emit('delete', this.config.id)
    }
  }
}
</script>
