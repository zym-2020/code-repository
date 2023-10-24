export function initialize_external(scene:any)
{
    function render_frame(view:any,scene:any,pass:any)
    {
        console.log("one frame from cesium!");
    }

    if(!scene.external_frame_functions)
    {
        scene.external_frame_functions=[];
    }
    scene.external_frame_functions.push(render_frame);
}