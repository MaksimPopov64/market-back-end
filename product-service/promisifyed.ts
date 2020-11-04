

  
import * as data from './productList.json';

export const promisifyed = () => {
    return new Promise((resolve) => {       
        setTimeout(() => resolve(data), 2500);
    });
};
