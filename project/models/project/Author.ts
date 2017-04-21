/**
 * Created by thanosp on 21/4/2017.
 */

export class Author{

    private name:string;
    private email:string;

    getName():string{
        return this.name;
    }

    setName(name:string){
        this.name = name;
    }

    getEmail():string{
        return this.email;
    }

    setEmail(email:string){
        this.email = email;
    }
}