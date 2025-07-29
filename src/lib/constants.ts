export const starterCode = {
    cpp: `#include <iostream>
  using namespace std;
  
  int main() {
      cout << "Hello, World!" << endl;
      return 0;
  }`,
    javascript: `// Welcome to the collaborative editor
  console.log("Hello, World!");
  
  function greet(name) {
      return \`Hello, \${name}!\`;
  }
  
  console.log(greet("CodeChef"));`,
    typescript: `// TypeScript collaborative coding
  interface User {
      name: string;
      id: number;
  }
  
  const user: User = {
      name: "Developer",
      id: 1
  };
  
  console.log(\`Hello, \${user.name}!\`);`,
    python: `# Python collaborative coding
  def greet(name: str) -> str:
      return f"Hello, {name}!"
  
  def main():
      print("Hello, World!")
      print(greet("CodeChef"))
  
  if __name__ == "__main__":
      main()`,
    java: `public class Main {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
          
          String name = "CodeChef";
          System.out.println("Hello, " + name + "!");
      }
  }`,
    c: `#include <stdio.h>
  
  int main() {
      printf("Hello, World!\\n");
      
      char name[] = "CodeChef";
      printf("Hello, %s!\\n", name);
      
      return 0;
  }`,
    rust: `fn main() {
      println!("Hello, World!");
      
      let name = "CodeChef";
      println!("Hello, {}!", name);
  }`,
    go: `package main
  
  import "fmt"
  
  func main() {
      fmt.Println("Hello, World!")
      
      name := "CodeChef"
      fmt.Printf("Hello, %s!\\n", name)
  }`,
  };
  
  // Simulated users for collaboration
  export const users = [
    {
      id: 1,
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      color: "bg-blue-500",
      cursorColor: "border-blue-500",
    },
    {
      id: 2,
      name: "Sarah Kim",
      avatar: "/placeholder.svg?height=32&width=32",
      color: "bg-purple-500",
      cursorColor: "border-purple-500",
    },
  ];