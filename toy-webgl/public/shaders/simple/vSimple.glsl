attribute vec3 aPos;
attribute vec3 aColor;

varying lowp vec3 ourColor;
  
void main()
{
  gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
  ourColor = aColor;
}
