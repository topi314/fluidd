<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
    min-width="150"
  >
    <template #activator="{ on, attrs, value }">
      <app-btn
        v-bind="attrs"
        small
        class="me-1 my-1"
        v-on="on"
      >
        <v-icon
          small
          class="me-1"
        >
          $camera
        </v-icon>
        {{ activeCamera }}
        <v-icon
          small
          class="ms-1"
          :class="{ 'rotate-180': value }"
        >
          $chevronDown
        </v-icon>
      </app-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="camera of availableCameras"
        :key="camera.uid"
        @click="$emit('select', camera.uid)"
      >
        <v-list-item-icon>
          <v-icon>
            {{ camera.uid === activeId ? '$check' : '$camera' }}
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ camera.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'

@Component({})
export default class CamerasMenu extends Mixins(StateMixin) {
  @Prop({ type: String })
  readonly selected?: string

  get activeId (): string {
    return this.selected ?? this.$typedState.webcams.activeWebcam
  }

  get activeCamera () {
    if (this.activeId === 'all') return this.$t('app.general.btn.all').toString()

    const camera: Moonraker.Webcam.Entry | undefined =
      this.$typedGetters['webcams/getWebcamById'](this.activeId)

    return camera?.name || this.$t('app.general.msg.camera_missing').toString()
  }

  get enabledWebcams (): Moonraker.Webcam.Entry[] {
    return this.$typedGetters['webcams/getEnabledWebcams']
  }

  get availableCameras (): Pick<Moonraker.Webcam.Entry, 'uid' | 'name'>[] {
    return [
      {
        uid: 'all',
        name: this.$t('app.general.btn.all').toString()
      },
      ...this.enabledWebcams
    ]
  }
}
</script>
