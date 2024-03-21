const fs = require('fs');

class DataProcessing {
    static raw_user_data = [];
    static formatted_user_data = [];
    static cleaned_user_data = []; // New variable to store cleaned data
    static json_object = null;

    static load_CSV(filename) {
        console.log(`Loading CSV file: ${filename}`);
        try {
            const csvData = fs.readFileSync(filename, 'utf8');
            DataProcessing.raw_user_data = csvData.split('\n').map(row => row.trim());
            console.log('CSV file loaded successfully.');
        } catch (error) {
            console.error(`Error loading CSV file: ${error.message}`);
        }
    }

    static format_data() {
        let rows = DataProcessing.raw_user_data;
        let formatted_data = [];
        // let name_data = {};

        for (let row of rows) {
            let [full_name, dob, age, email] = row.split(',');
            let [title, ...name_parts] = full_name.split(' ');
            let [first_name, middle_name, surname] = name_parts;

            // Extract name from email if name is missing
            if (!first_name && email) {
                let emailParts = email.split('@')[0].split('.');
                first_name = emailParts[0];
                surname = emailParts[1];
            }
            // Extract surname from email if surname is missing
            if (!surname && email) {
                let emailParts = email.split('@')[0].split('.');
                if (emailParts.length > 1) {
                    surname = emailParts[emailParts.length - 1];
                }
            }
            // Format name
            if (first_name) {
                first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1).toLowerCase();
            }
            if (middle_name) {
                middle_name = middle_name.charAt(0).toUpperCase() + middle_name.slice(1).toLowerCase();
            }


            if (!surname) {
                surname = middle_name;
                middle_name = "";
            } else {
                surname = surname.charAt(0).toUpperCase() + surname.slice(1).toLowerCase();
            }

            // Format date of birth
      if (dob) {
        let dobParts = dob.split('-');
        if (dobParts.length === 3) {
          let [day, month, year] = dobParts;
          if (month.length === 2) {
            if (year.length === 2) {
              let currentYear = new Date().getFullYear();
              let currentCentury = Math.floor(currentYear / 100);
              year = (currentCentury - 1) * 100 + parseInt(year);
              if (year > currentYear) {
                year -= 100;
              }
            }
            dob = `${day}/${month}/${year}`;
          } else if (month.length === 3) {
            let monthNames = {
              jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
              jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
            };
            month = monthNames[month.toLowerCase()];
            if (year.length === 2) {
              let currentYear = new Date().getFullYear();
              let currentCentury = Math.floor(currentYear / 100);
              year = (currentCentury - 1) * 100 + parseInt(year);
              if (year > currentYear) {
                year -= 100;
              }
            }
            dob = `${day}/${month}/${year}`;
          }
        } else {
          let dateObject = new Date(dob);
          if (!isNaN(dateObject.getTime())) {
            let day = dateObject.getDate().toString().padStart(2, '0');
            let month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
            let year = dateObject.getFullYear();
            dob = `${day}/${month}/${year}`;
          }
        }
      }
           // Convert age to integer if it exists
let ageInt = null;
if (age) {
  if (typeof age === 'string') {
    // Check if age is in word format
    const ageWords = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
      thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
    };

    const ageParts = age.toLowerCase().split('-');
    ageInt = ageParts.reduce((total, part) => total + (ageWords[part] || 0), 0);

    if (ageInt === 0) {
      // If age is not in word format, try parsing it as a number
      ageInt = parseInt(age);
    }
  } else {
    ageInt = age;
  }
}





 // Format email
 let formatted_email = "";
 if (first_name && surname) {
   formatted_email = `${first_name.toLowerCase()}.${surname.toLowerCase()}@example.com`;
 }

            

           formatted_data.push({
                title: title || "",
                first_name,
                middle_name: middle_name || "",
                surname,
                date_of_birth: dob,
                age:ageInt,
                email: formatted_email
            });
        }

        // Push all the formatted data to the formatted_data array
    for (let name_key in name_data) {
        formatted_data.push(...name_data[name_key]);
      }
        DataProcessing.formatted_user_data = JSON.stringify(formatted_data, null, 2);
        DataProcessing.json_object = JSON.parse(DataProcessing.formatted_user_data);
    }

    static clean_data() {
      let data = JSON.parse(DataProcessing.formatted_user_data);
      let email_data = {};

 // Remove absolute duplicates
  data = data.filter((item, index, self) =>
  index === self.findIndex((t) => (
    t.title === item.title &&
    t.first_name === item.first_name &&
    t.middle_name === item.middle_name &&
    t.surname === item.surname &&
    t.date_of_birth === item.date_of_birth &&
    t.age === item.age &&
    t.email === item.email
  ))
);
        
      for (let item of data) {
        // Check if the title is missing
        if (!item.title.match(/^(Mr|Mrs|Miss|Ms|Dr)\.?$/i)) {
          let nameParts = [item.title, item.first_name, item.middle_name, item.surname].filter(Boolean);
          // Remove duplicate surnames from nameParts
        if (nameParts.length > 1 && nameParts[nameParts.length - 1] === nameParts[nameParts.length - 2]) {
          nameParts.pop();
        }
          console.log(nameParts)
          if (nameParts.length === 3) {
            // All 3 names present
            item.first_name = nameParts[0];
            item.middle_name =  nameParts[1];
            item.surname = nameParts[2];
            // console.log( `first_name: ${item.first_name} middle name: ${item.middle_name} surname : ${item.surname}`)
            // console.log("middle: ", item.middle_name)
            // console.log("surname: ",item.surname)
          } else if (nameParts.length === 2) {
            // Only 2 names present
            item.first_name = nameParts[0];
            item.surname = nameParts[1];
            item.middle_name = "";
          } else if (nameParts.length === 1 || nameParts.length === 0) {
            // Only 1 name present or no name present
            if (item.email.includes('@')) {
              let emailParts = item.email.split('@')[0].split('.');
                  // Extract name from email if name is missing
              if (!item.first_name && emailParts.length > 0) {
                item.first_name = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
              }
              
              // Extract surname from email if surname is missing
              if (!item.surname && emailParts.length > 1) {
                item.surname = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
              }
              
            } 
            item.middle_name = "";
          }
          item.title = "";
        }
         // Calculate age based on the formatted date of birth
        if (item.date_of_birth) {
          let [day, month, year] = item.date_of_birth.split('/');
          let dobDate = new Date(year, month - 1, day);
          let today = new Date();
          let age = today.getFullYear() - dobDate.getFullYear();
          let monthDiff = today.getMonth() - dobDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
          }
          item.age = age;
        }

 // Generate email based on first_name and surname
let formatted_email = "";
if (item.first_name && item.surname) {
  formatted_email = `${item.first_name.toLowerCase()}.${item.surname.toLowerCase()}@example.com`;
}
item.email = formatted_email;
 // Generate unique key for duplicate emails
 let email_key = item.email;
 if (!email_data[email_key]) {
   email_data[email_key] = [];
 }
 email_data[email_key].push(item);
}

// Update email for duplicate emails
  for (let email_key in email_data) {
    let items = email_data[email_key];
    if (items.length > 1) {
      // If there are multiple occurrences, add the numeric identifier to the email
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let formatted_email = "";
        if (item.first_name && item.surname) {
          formatted_email = `${item.first_name.toLowerCase()}.${item.surname.toLowerCase()}${i + 1}@example.com`;
        }
        item.email = formatted_email;
      }
    }   
    }
        // Sort the properties in the desired order
    DataProcessing.cleaned_user_data = data.map(item => {
      return {
        title: item.title || "",
        first_name: item.first_name,
        middle_name: item.middle_name || "",
        surname: item.surname,
        date_of_birth: item.date_of_birth,
        age: item.age,
        email: item.email
      };
    });
  }
    

    static processData(filename) {
        DataProcessing.load_CSV(filename);
        DataProcessing.format_data();
        DataProcessing.clean_data();

        // console.log('Formatted User Data:');
        // console.log(DataProcessing.json_object);

        // console.log('Cleaned User Data:');
        // console.log(DataProcessing.cleaned_user_data)

        // Write formatted user data to a file
        fs.writeFileSync('formatted_user_data.json', JSON.stringify(DataProcessing.formatted_user_data, null, 2));

        // Write cleaned user data to a file
        fs.writeFileSync('cleaned_user_data.json', JSON.stringify(DataProcessing.cleaned_user_data, null, 2));

        console.log('Formatted User Data written to formatted_user_data.json');
        console.log('Cleaned User Data written to cleaned_user_data.json');
    }
}
const filename = 'Raw_User_Data.csv';
DataProcessing.processData(filename);
