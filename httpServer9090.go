package main

import (
	"fmt"	
	"log"
	"net/http"	
	"strings"
) 


func printFormVal(w http.ResponseWriter, r *http.Request) {

	r.ParseForm()       // parse arguments, you have to call this by yourself
	fmt.Println(r.Form) // print form information in server side
	fmt.Println("path", r.URL.Path)
	fmt.Println("scheme", r.URL.Scheme)
	fmt.Println("query", r.URL.Query())
	fmt.Println("url ", r.URL.RequestURI())

	fmt.Println(r.Form["url_long"])
	for k, v := range r.Form {
		fmt.Println("key:", k)
		fmt.Println("val:", strings.Join(v, ""))
	}
	fmt.Fprintf(w, "Hello astaxie!"+r.URL.Path) // send data to client side
}



func main() {
    
    // Example of setting up a virtual directory outside 
    // the current server directory
    http.Handle("/mypp/", http.StripPrefix("/mypp/",
        http.FileServer(http.Dir("../.."))))

    http.Handle("/", http.StripPrefix("/",
        http.FileServer(http.Dir("."))))
        
        
    // Example of setting up a custom hander. 
	http.HandleFunc("/formTest", printFormVal) // set router
    
    // Start the listener.
	err := http.ListenAndServe(":9090", nil) // set listen port
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
