import{O as a}from"./bsConstants-DqcM23cc.js";import{B as e,T as i}from"./bsSceneCache-CGFGXyI6.js";await a.onReady(async()=>{if(await a.scene.isReady()===!1){const n=a.scene.onReadyChange(async s=>{s&&(n(),await t())})}else await t()});async function t(){await e.InitializeCache(),await i.StartThreatre(),e.SetupHandlers(),e.OpenBroadcast()}
