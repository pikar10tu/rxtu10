import { ref } from 'vue'

const message = ref('')
const type    = ref('info')
const visible = ref(false)
let _timer = null

export function useToast() {
    function toast(msg, t = 'info', duration = 2800) {
        message.value = msg
        type.value    = t
        visible.value = true
        clearTimeout(_timer)
        _timer = setTimeout(() => { visible.value = false }, duration)
    }
    return { message, type, visible, toast }
}
