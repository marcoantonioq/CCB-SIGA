import { reactive } from 'vue'

export const store = reactive({
  messages: [] as string[],
  notify(msg: string) {
    this.messages.push(msg)
  }
})
