class User {
    constructor(name, gender, birth, country, email, password, photo, admin){
        this._id;
        this.name = name;
        this.gender = gender;
        this.birth = birth;
        this.country = country;
        this.email = email;
        this.password = password;
        this.photo = photo;
        this.admin = admin;
        this.register = new Date();
    }

    getNewId(){
        if (!window.id) window.id = 0;
        id++;
        return id;
    }

    parseFromJson(json){
        for (let atribute in json){            
            if (atribute == 'register'){
                this[atribute] = new Date(json[atribute]);
            
            } else {
                this[atribute] = json[atribute];
            }
        }
    }

    parseToJson(){
        let json = {};
        
        Object.keys(this).forEach((key) => {
            if (this[key] != undefined) json[key] = this[key];
        });
        return json;
    }

    loadStorage(){
        //let users = User.getUsersStorage();

        HttpRequest.get('http://localhost:3000/users').then((json) => {
            json.users.forEach((data) => {
                let user = new User();
                user.parseFromJson(data);
                this.createTr(user);
            }); 
            this.updateCountUsers();
        });        
    }

    removeStorage(){
        return HttpRequest.delete(`/users/${this._id}`);
    }

    saveStorage(type){
        //let users = User.getUsersStorage();
        //localStorage.setItem('users', JSON.stringify(users));
        //sessionStorage.setItem('users', JSON.stringify(users));

        return new Promise((resolve, reject) => {

            let promise;

            if (type == 'update'){        
                promise = HttpRequest.put(`/users/${this._id}`, this.parseToJson());
            } else {
                promise = HttpRequest.post('/users', this.parseToJson());
            }        

            promise.then((data) => {
                this.parseFromJson(data);
                resolve(this);
            
            }).catch((e) => {
                reject(e);
            });
        });
    }  
    
    static getUsersStorage(){
        let users = [];
        
        if (sessionStorage.getItem('users')){
            //users = JSON.parse(localStorage.getItem('users'))
            users = JSON.parse(sessionStorage.getItem('users'))
        }
        return users;
    }  

    //Falta Implementar o remove do localStorage
}