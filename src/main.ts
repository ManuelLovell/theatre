import OBR from '@owlbear-rodeo/sdk';
import { BSCACHE } from './utilities/bsSceneCache';
import { THEATRE } from './theatre';
import './styles/main-style.css'

await OBR.onReady(async () =>
{
    await BSCACHE.InitializeCache();

    setTimeout(async () =>
    {
        if (BSCACHE.sceneReady === false) await BSCACHE.InitializeCache();
        await THEATRE.StartThreatre();
        BSCACHE.SetupHandlers();
        BSCACHE.OpenBroadcast();
    }, 1000);
});