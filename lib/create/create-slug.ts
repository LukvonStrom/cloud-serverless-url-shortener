import {URL} from "url";
export function slugify(url: string){
    if(!isValidUrl(url)){
        throw new Error("invalid URL")
    }
    return url.substr(0, 5);
}

function isValidUrl(urlLike: string){
    try{
        new URL(urlLike);
        return true;
    }catch(e){
        return false;
    }
}