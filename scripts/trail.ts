import { MySDK } from 'tixel-sdk'

let tixel = new MySDK({
    apiKey: 'test_1234'
})


const handleMe = async () => {
    tixel.getMe()
}

handleMe()

// tixel.activateUser('test_1234')