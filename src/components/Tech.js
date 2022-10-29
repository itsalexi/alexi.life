import React from 'react';

function Tech({ name }) {
    return (
        <div className={`project-tech ${name}`}>#{name}</div>
    );
}

export default Tech;
