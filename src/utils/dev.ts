export const debugLogger = (name?:string )=>{
  name = "Log::["+name+"]";
  let i = 0;


  return {
    log(data:any = ""){
      ++i;
      console.log(name,i,data)
    }
  }
}
