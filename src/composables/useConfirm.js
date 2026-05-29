import { ref } from 'vue'

const visible  = ref(false)
const message  = ref('')
let _resolve   = null

export function useConfirm() {
    function confirm(msg) {
        message.value = msg
        visible.value = true
        return new Promise(resolve => { _resolve = resolve })
    }
    function ok()     { visible.value = false; _resolve?.(true)  }
    function cancel() { visible.value = false; _resolve?.(false) }
    return { visible, message, confirm, ok, cancel }
}
