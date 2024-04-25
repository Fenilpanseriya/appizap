import React from 'react';

export default function WorkflowBuilder({ fill = '#C1C8CD', width = '25', className = '', viewBox = '0 0 25 25' }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 4.5C7.5 3.39543 8.39543 2.5 9.5 2.5H14.5C15.6046 2.5 16.5 3.39543 16.5 4.5V6.5C16.5 7.60457 15.6046 8.5 14.5 8.5H9.5C8.39543 8.5 7.5 7.60457 7.5 6.5V4.5Z"
        fill={fill}
      />
      <path
        d="M1.5 17.5C1.5 16.3954 2.39543 15.5 3.5 15.5H8.5C9.60457 15.5 10.5 16.3954 10.5 17.5V19.5C10.5 20.6046 9.60457 21.5 8.5 21.5H3.5C2.39543 21.5 1.5 20.6046 1.5 19.5V17.5Z"
        fill={fill}
      />
      <path
        d="M13.5 17.5C13.5 16.3954 14.3954 15.5 15.5 15.5H20.5C21.6046 15.5 22.5 16.3954 22.5 17.5V19.5C22.5 20.6046 21.6046 21.5 20.5 21.5H15.5C14.3954 21.5 13.5 20.6046 13.5 19.5V17.5Z"
        fill={fill}
      />
      <path
        fill={fill}
        d="M12 9.75V12.25M12 12.25H6V14.25M12 12.25H18V14.25"
        stroke={fill}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
