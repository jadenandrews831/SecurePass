import argparse
import json
import random

parser = argparse.ArgumentParser()
parser.add_argument('rule', help="Rule to add to prompt text", type=str, choices=['ssn', 'ein', 'card'])

args = parser.parse_args()
rule = args.rule

prompts = []

f_prompt = open("prompt.csv", "a")

if (rule == 'ssn'):
  word_bomb = 'My first name is David. I come from Los Angeles California. My Social Security Number is 212-34-9863\
  More effective data could not be found. Person Social Security Number: Your social security number Social Security\
  RECIPIENT\'S identification number Social Security number variations: The nine-digit SSN is composed of three parts:\
  apply for an SSN for your Employee\'s social security number This is a post the at there some my of be use her than\
  and	this	an	would	first a	have each	make water to from which like been in or she	him call is one do into who you had\
  how	time oil that by their has its it word if look now he but will two find was not up more long for what other write down\
  on all about go day are were out see did as we many number get with when then no come his your them	way made they can these\
  could may I said so people part'.split(' ')

  ein_pref = [10, 12, 60, 67, 50, 53, 1,2,3,4,5,6,11,13,14,16,21,22,23,25,34,51,52,54,55,56,57,58,59,65,30,32,35,36,37,38,61,15,24,40,44,94,95,80,90,33,39,41,42,43,46,48,62,63,64,66,68,71,72,73,74,75,76,77,85,86,87,88,91,92,93,98,99,20, 26, 27, 45, 46, 47, 81, 82, 83, 84,31]

  card_pref = [4,5,6,7]

  for i in range(200):
    prompt_text = f'{str(random.randint(1, 665)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(200):
    prompt_text = f'{str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)} {random.choice(word_bomb)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'SSN: {prompt_text},SSN: {prompt_text}\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.choice(card_pref))}{str(random.randint(0, 999)).zfill(3)} {str(random.randint(0,9999)).zfill(4)} {str(random.randint(0,9999)).zfill(4)} {str(random.randint(0,9999)).zfill(4)}'
    prompts.append(f'SSN: {prompt_text},SSN: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.choice(card_pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}'
    for i in range(random.randrange(0, 19)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += str({random.choice(word_bomb)})
    prompts.append(f'SSN: {prompt_text},SSN: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.choice(ein_pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)}'
    prompts.append(f'SSN: {prompt_text},SSN: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.choice(ein_pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)}-{str(random.randint(0,999)).zfill(3)}'
    for i in range(random.randrange(0, 19)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += str(random.choice(word_bomb))
    prompts.append(f'SSN: {prompt_text},SSN: Not Found\n')
    

  for i in range(200):
    prompt_text = ''
    for i in range(random.randrange(40)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompts.append(f'SSN: {prompt_text},SSN: Not Found\n')

  for prompt in prompts:
    print(prompt)
    f_prompt.write(prompt)

elif (rule == 'ein'):
  word_bomb = 'Official EIN/Tax ID Sole Prop EIN Employer Identification Number Federal Employer Identification Number\
  Federal Tax Identification Number Form: SS-4 Employer identification number (EIN) apply for an EIN in various ways\
  If you want to verify your EIN equitable treatment for all taxpayers EIN is not your tax-exempt number file business taxes\
  9-digit Employer ID number Federal Tax Identification Number FEIN Employer Identification Number the at there some my of be use her than\
  and	this	an	would	first a	have each	make water to from which like been in or she	him call is one do into who you had\
  how	time oil that by their has its it word if look now he but will two find was not up more long for what other write down\
  on all about go day are were out see did as we many number get with when then no come his your them	way made they can these\
  could may I said so people part'.split(' ')

  pref = [10, 12, 60, 67, 50, 53, 1,2,3,4,5,6,11,13,14,16,21,22,23,25,34,51,52,54,55,56,57,58,59,65,30,32,35,36,37,38,61,15,24,40,44,94,95,80,90,33,39,41,42,43,46,48,62,63,64,66,68,71,72,73,74,75,76,77,85,86,87,88,91,92,93,98,99,20, 26, 27, 45, 46, 47, 81, 82, 83, 84,31]

  card_pref = [4,5,6,7]
  for i in range(200):
    prompt_text = f'{str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(200):
    prompt_text = f'{str(random.choice(pref)).zfill(2)}{str(random.randint(0,30)).zfill(7)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)}-{str(random.randint(0,999)).zfill(3)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)} {random.choice(word_bomb)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'EIN: {prompt_text},EIN: {prompt_text}\n')

  for i in range(100):
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    prompts.append(f'EIN: {prompt_text},EIN: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    for i in range(random.randrange(0, 19)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += str({random.choice(word_bomb)})
    prompts.append(f'EIN: {prompt_text},EIN: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.randint(1, 665)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    prompts.append(f'EIN: {prompt_text},EIN: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.choice(card_pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}'
    for i in range(random.randrange(0, 19)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += str(random.choice(word_bomb))
    prompts.append(f'EIN: {prompt_text},EIN: Not Found\n')
    

  for i in range(200):
    prompt_text = ''
    for i in range(random.randrange(20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompts.append(f'EIN: {prompt_text},EIN: Not Found\n')

  for prompt in prompts:
    print(prompt)
    f_prompt.write(prompt)

elif (rule == 'card'):
  pref = [4,5,6,7]

  ein_pref = [10, 12, 60, 67, 50, 53, 1,2,3,4,5,6,11,13,14,16,21,22,23,25,34,51,52,54,55,56,57,58,59,65,30,32,35,36,37,38,61,15,24,40,44,94,95,80,90,33,39,41,42,43,46,48,62,63,64,66,68,71,72,73,74,75,76,77,85,86,87,88,91,92,93,98,99,20, 26, 27, 45, 46, 47, 81, 82, 83, 84,31]

  word_bomb = 'PCI Data Security Standard (PCI DSS) Primary Account Number (PAN) CAV2 CVC2 CVV2 CID cardholder data \
  credit card debit card bank Amex Discover USD CN CVV CODE Visa Shop privately and securely financial protection\
  National Bank PII Bank Identification Number (BIN) The issuer identification number (IIN) identify the bank account number/s \
  to as sensitive personal information since number on receipts and documents the at there some my of be use her than\
  and	this	an	would	first a	have each	make water to from which like been in or she	him call is one do into who you had\
  how	time oil that by their has its it word if look now he but will two find was not up more long for what other write down\
  on all about go day are were out see did as we many number get with when then no come his your them	way made they can these\
  could may I said so people part'.split(' ')

  for i in range(200):
    prompt_text = f'{str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')

  for i in range(200):
    prompt_text = f'{str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)} {str(random.randint(0,9999)).zfill(4)} {str(random.randint(0,9999)).zfill(4)} {str(random.randint(0,9999)).zfill(4)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{str(random.choice(pref))}{str(random.randint(0, 99999999999999)).zfill(15)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')
  
  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)} {random.choice(word_bomb)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')
  
  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')
  
  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {random.choice(word_bomb)} {str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{random.choice(word_bomb)} {str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')

  for i in range(100):
    prompt_text = f'{str(random.choice(pref))}{str(random.randint(0, 999)).zfill(3)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)}-{str(random.randint(0,9999)).zfill(4)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)} {random.choice(word_bomb)}'
    prompts.append(f'CARD: {prompt_text},CARD: {prompt_text}\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 15)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.randint(667, 899)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    prompts.append(f'CARD: {prompt_text},CARD: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.randint(1, 665)).zfill(3)}-{str(random.randint(1, 99)).zfill(2)}-{str(random.randint(1, 9999)).zfill(4)}'
    for i in range(random.randrange(0, 19)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += str({random.choice(word_bomb)})
    prompts.append(f'CARD: {prompt_text},CARD: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 10)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.choice(pref)).zfill(2)}{str(random.randint(0,30)).zfill(7)}'
    prompts.append(f'CARD: {prompt_text},CARD: Not Found\n')

  for i in range(100):
    prompt_text = ''
    for i in range(random.randrange(1, 20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += f'{str(random.choice(pref)).zfill(2)}-{str(random.randint(0,30)).zfill(7)}'
    for i in range(random.randrange(0, 19)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompt_text += str(random.choice(word_bomb))
    prompts.append(f'CARD: {prompt_text},CARD: Not Found\n')
    

  for i in range(200):
    prompt_text = ''
    for i in range(random.randrange(20)):
      prompt_text += str(random.choice(word_bomb))+' '
    prompts.append(f'CARD: {prompt_text},CARD: Not Found\n')


  for prompt in prompts:
    print(prompt)
    f_prompt.write(prompt)


else:
  print("There was an issue")
  pass