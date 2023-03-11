

def checkRole(user):
    #make a list of allowed roles
    allowedRoles = ['Brand Manager', 'Social Media Manager', 'Social Media Specialist', 'Social Media Coordinator', 'Administrator', 'Recruiter', 'Chief Marketing Officer', 'Chief Executive Officer','Content Manager']
    #check if the user's role is in the list of allowed roles
    if user.role in allowedRoles:
        return True
    return False

def checkTraining(user):
    #make a list of all training requirements
    trainingList = ['Employee Handbook', 'Corporate Social Media Training', 'Cybersecurity Training', 'Social Media Policies & Guidelines']
    #check that the user has completed all training requirements. if not, return which training they are missing
    if user.training == trainingList:
        return True
    else:  
        for training in trainingList:
            if training not in user.training:
                missing += training
    return missing

def checkPostHistory(user):
    #check if the user has any negative post history
    if user.post_history == 'No negative post history':
        return True
    return user.post_history