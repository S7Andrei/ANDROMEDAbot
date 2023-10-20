/* !!Função do Armazenamento de recebimento das informações durante a execução do Client */
const { create } = require('@open-wa/wa-automate')
const handleImageToSticker = require('./handles/handleImageToSticker')

const App =async (client) => {
  await  client.onAnyMessage( async (message) => {
        if(message.text.includes('!figurinhas')){
            await handleImageToSticker(client, message)
            
        }
    })
}

create().then((client) => client)