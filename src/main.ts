import OBR from '@owlbear-rodeo/sdk';
import { BSCACHE } from './utilities/bsSceneCache';
import { THEATRE } from './theatre';
import './styles/main-style.css'

await OBR.onReady(async () =>
{
    const sceneReady = await OBR.scene.isReady();
    
    if (sceneReady === false)
    {
        const startup = OBR.scene.onReadyChange(async (ready) =>
        {
            if (ready)
            {
                startup(); // Kill startup Handler
                await BeginTheTheatre();
            }
        });
    }
    else
    {
        await BeginTheTheatre();
    }
});

async function BeginTheTheatre()
{
    await BSCACHE.InitializeCache();
    await THEATRE.StartThreatre();
    BSCACHE.SetupHandlers();
    BSCACHE.OpenBroadcast();
}