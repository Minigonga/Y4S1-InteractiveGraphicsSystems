Moodle Task - PW1-A
Did you observe any differences when changing the order of the lines manipulating the transformations?
R: No, since in Three.js objects have a fixed transformation order.

Moodle Task - PW1-B
What were the differences between setting the rotation property and calling the rotateX() function? Did it behave as it would in WebGL/WebCGF?
R: When setting the rotation property, even thought it was changed twice, the box only rotated once, and calling the rotateX() function makes the box rotate twice. The func rotateX() behaves like WebGL/WebCGF transformations, since rotations accumulate through matrix multiplication, setting the rotation property is a three.js convenience, which doesn’t exist in raw WebGL/WebCGF.


Moodle Task - PW1-C
How does the shininess affect the material components (ambient, diffuse, specular)?
R: Specular: Higher shininess → smaller, sharper highlights; lower → larger, softer highlights. Ambient & Diffuse: Not affected by shininess.
What were the visual differences between changing the point or the ambient light to red?
R: Point light red: Only surfaces facing the light turn red; highlights are red. Ambient red: Whole scene is uniformly red, including shadows.
What changed visually in the scene when the light source was moved? How is that change connected to the local illumination model?
R: Changes brightness, shadow, and specular highlight positions. Diffuse depends on light-surface angle; specular depends on reflection-viewer angle; ambient remains constant.


Moodle Task - PW1-D
Were there any unexpected behaviors with any of the requested changes?
R: When both lights were enabled, only the directional light was visible, as its intensity and range overpowered the spotlight. Other than that, there were no unexpected behaviors.
Did the light helper behave as expected?
R: Yes, it did. It showed the direction of both lights and the spotlight’s limits, which helped improve the precision of the light’s reach.

Moodle Task - PW1-E
Were you able to see changes in real time of the wrap mode? What was necessary for those changes to happen?
R: We were able to see the changes in real time. For that we need to create functions that update the variables in the art whenever a value is changed in the interface. In this case, we have two functions, one to toggle between wrap and repeat modes, and another to adjust the rotation angle.