This is an animation to illustrate an idea about 2-d spatial
generalizations of functions. To produce output.gif, I 
rendered the animation in blender then used imagemagick
'convert' on the resulting .png files, simply

    $ convert -delay 25 *.png output.gif
