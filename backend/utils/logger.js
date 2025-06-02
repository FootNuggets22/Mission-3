// logger utility
 const log = (label, data) => {
    if(process.env.NODE_ENV !== "production") {
        const time = new Date().toISOString(); 
        console.log(`\n[${time}] ${label}:`);
        if (data !== undefined) {
            console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2)); ;
        }
    }
}

export default log;