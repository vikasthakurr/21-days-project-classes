//create or write operation
//read or fetch operation
//update or append operation
//delete or unlink operation

import fs from "fs";

//write operation and it is sync in nature

// fs.writeFileSync("21days.pdf", "this is last class of vanilla js");

//read the file
// const data = fs.readFileSync("./21days-project.text", "utf-8");
// console.log(data);

// const res = fs.readFile("./21days-project.text", "utf-8", (data, err) => {
//   if (!data) {
//     console.log("something went wrong");
//   }
//   return data;
// });
// console.log(res);
//append the content

// fs.appendFileSync(
//   "./21days-project.text",
//   "\n this might not be the last class with me"
// );

//unlink operation
// fs.unlinkSync("./21days.pdf");
