class Utils {

    static dateFormat(date){
        if (date) return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;        
    }
}