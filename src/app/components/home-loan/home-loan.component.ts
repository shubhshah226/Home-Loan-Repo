import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home-loan',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home-loan.component.html',
  styleUrl: './home-loan.component.css',
})
export class HomeLoanComponent {
  constructor() {}

  loanSummary: any = {};

  selectedRow: any = null;

  showPrepayment = false;

  amortization: any[] = [];
  loanForm = new FormGroup({
    amount: new FormControl(7500000, [Validators.required]),

    interest: new FormControl(7.15, [Validators.required]),

    tenure: new FormControl(25, [Validators.required]),
  });

  groupedAmortization: any = [];
 calculateLoan(){

this.amortization=[];

const amount =
this.loanForm.controls.amount.value!;

const annualRate =
this.loanForm.controls.interest.value!;

const years =
this.loanForm.controls.tenure.value!;


const monthlyRate =
annualRate/12/100;

const months =
years*12;


const emi =

(amount*
monthlyRate*
Math.pow(
1+monthlyRate,
months
))
/
(
Math.pow(
1+monthlyRate,
months
)-1
);


this.loanSummary={

loanAmount:amount,

emi:Math.round(emi),

interest:0,

total:0,

totalPaidOverYears:0,

principalPaid:0,

interestPaid:0

};


this.generateSchedule(
amount,
emi,
monthlyRate,
months
);


this.calculateOverallPaidAmount();


// Update final values

this.loanSummary.interest =

this.loanSummary.interestPaid;


this.loanSummary.total=

this.loanSummary.principalPaid+

this.loanSummary.interestPaid;

}

  generateSchedule(
balance:number,
emi:number,
monthlyRate:number,
months:number
){

this.amortization=[];

let currentDate=
new Date();

currentDate.setMonth(
currentDate.getMonth()+1
);


for(
let i=1;
i<=months;
i++
){

const interest=
balance*
monthlyRate;


const principal=
emi-interest;


balance=
balance-principal;


this.amortization.push({

id:i,

year:
currentDate.getFullYear(),

month:
currentDate.toLocaleString(
'default',
{
month:'short'
}
),

emi:
emi,

interest:
interest,

principal:
principal,

prepayment:0,

balance:
Math.max(
balance,
0
)

});


currentDate.setMonth(
currentDate.getMonth()+1
);


if(balance<=0){
break;
}

}


this.groupByYear();

}
  toggleYear(year: any) {
    year.expanded = !year.expanded;
  }

  groupByYear() {

const grouped:any = {};

this.amortization.forEach((item:any)=>{

if(!grouped[item.year]){

grouped[item.year]={

year:item.year,

expanded:false,

months:[]

};

}

grouped[item.year]
.months
.push(item);

});


this.groupedAmortization=
Object.values(grouped);


/* Open first year automatically */

if(
this.groupedAmortization.length>0
){

this.groupedAmortization
.forEach(
(x:any)=>
x.expanded=false
);

this.groupedAmortization[0]
.expanded=true;

}

}

  openPrepayment(row: any) {
    this.selectedRow = row;

    this.showPrepayment = true;
  }

applyPrepayment(prePaymentAmount:number){

if(
!this.selectedRow ||
prePaymentAmount<=0
){
return;
}


const rowIndex=
this.amortization.findIndex(
x=>x.id===this.selectedRow.id
);


if(rowIndex===-1){
return;
}


const oldRemainingBalance=

this.amortization[rowIndex]
.balance;


let remainingBalance=

oldRemainingBalance-
prePaymentAmount;


if(remainingBalance<=0){

alert(
'Loan completed after prepayment'
);

return;

}


const annualInterest=

this.loanForm.controls
.interest.value!;


const monthlyRate=

annualInterest/
12/
100;


const emi=
this.loanSummary.emi;


/* Existing future rows */

const existingFutureRows=

this.amortization.slice(
rowIndex+1
);


/* Interest before recalculation */

const oldInterest=

existingFutureRows
.reduce(

(sum,row)=>

sum+
Number(
row.interest ||0
),

0

);


/* Keep previous rows */

const previousRows=

this.amortization.slice(
0,
rowIndex+1
);


this.amortization=
[...previousRows];


let currentDate=
new Date();

currentDate.setFullYear(
this.selectedRow.year
);


currentDate.setMonth(

new Date(

Date.parse(

this.selectedRow.month+

' 1,'+

this.selectedRow.year

)

).getMonth()+1

);


let newInterest=0;

let newMonths=0;


/* Generate new schedule */

while(
remainingBalance>0
){

const interest=

remainingBalance*
monthlyRate;


newInterest+=
interest;


const principal=

emi-
interest;


remainingBalance-=
principal;


newMonths++;


this.amortization.push({

id:
this.amortization.length+1,

year:
currentDate
.getFullYear(),

month:
currentDate
.toLocaleString(
'default',
{
month:'short'
}
),

emi:emi,

interest:interest,

principal:principal,

balance:
Math.max(
remainingBalance,
0
),

prepayment:
newMonths===1
?prePaymentAmount
:0

});


currentDate.setMonth(
currentDate.getMonth()+1
);

}


/* Interest saved */

const interestSaved=

Math.round(
oldInterest-
newInterest
);


/* Tenure reduction */

const oldMonths=

existingFutureRows.length;


const tenureReduced=

oldMonths-
newMonths;


/* Add event row */

this.amortization.splice(

rowIndex+1,

0,

{

isPrepaymentInfo:true,

year:
this.selectedRow.year,

month:
this.selectedRow.month,

prepaymentAmount:
prePaymentAmount,

interestSaved:
interestSaved,

tenureReduced:
tenureReduced

}

);


/* Group by year */

this.groupByYear();


/* Close all years */

this.groupedAmortization
.forEach(
(x:any)=>
x.expanded=false
);


/* Open selected year */

const selectedYear=

this.groupedAmortization.find(

(x:any)=>

x.year===

this.selectedRow.year

);


if(selectedYear){

selectedYear.expanded=true;

}


/* Recalculate summary */

this.calculateOverallPaidAmount();

this.showPrepayment=false;

}

  reset() {
    this.loanForm.reset({
      amount: 7500000,
      interest: 7.15,
      tenure: 25,
    });

    this.loanSummary = {
      loanAmount: 0,
      interest: 0,
      total: 0,
      emi: 0,
      totalPaidOverYears:0,
      principalPaid:0,
      interestPaid:0
    };

    this.amortization = [];

    this.groupedAmortization = [];

    this.selectedRow = null;

    this.showPrepayment = false;
  }

calculateOverallPaidAmount() {

let totalPaid = 0;

let principalPaid = 0;

let interestPaid = 0;


this.amortization.forEach((row:any)=>{


// Ignore info row
if(row.isPrepaymentInfo){
return;
}


const emi =
Number(row.emi || 0);

const interest =
Number(row.interest || 0);

const principal =
Number(row.principal || 0);

const prepayment =
Number(row.prepayment || 0);


totalPaid +=
emi + prepayment;


principalPaid +=
principal + prepayment;


interestPaid +=
interest;

});


this.loanSummary.totalPaidOverYears =

Math.round(
totalPaid
);


this.loanSummary.principalPaid =

Math.round(
principalPaid
);


this.loanSummary.interestPaid =

Math.round(
interestPaid
);


this.loanSummary.interest =

this.loanSummary.interestPaid;


this.loanSummary.total =

this.loanSummary.principalPaid +
this.loanSummary.interestPaid;

}
}
