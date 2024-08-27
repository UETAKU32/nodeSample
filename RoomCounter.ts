export class RoomCounter {
    private counter : number ;
    constructor(){
      this.counter = 0;
    }
  
    increment () :void {
      this.counter += 1;
    }
  
    getCount () :number {
      return this.counter
    }
  }