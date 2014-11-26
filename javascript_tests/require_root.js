(function()
{
    var fileref=document.createElement('script');
    fileref.setAttribute('type','text/javascript');
    fileref.setAttribute('src', 'require.js');
    document.getElementsByTagName('head')[0].appendChild(fileref);

    var fileref=document.createElement('script');
    fileref.setAttribute('type','text/javascript');
    fileref.setAttribute('src', 'my_main.js');
    document.getElementsByTagName('head')[0].appendChild(fileref);
}
)();
