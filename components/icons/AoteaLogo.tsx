
import React, { useState } from 'react';

const AoteaLogo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  // Always render the uploaded school logo image from public/images.
  // If the file isn't present the image will fail to load and nothing will be shown.
  // Use explicit filenames that match the uploaded files.
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img src="/images/Aotea College Image.jpg" {...props} />
  );
};

export default AoteaLogo;
