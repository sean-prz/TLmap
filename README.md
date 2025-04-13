## The project

This application, hosted on Amazon Web Services, processes reports from traffic agents in public transportation systems. <br>
It filters and classifies the incoming data to deliver concise and structured information about where inspections or controls have taken place. <br>
The relational data can be utilized for various purposes, such as generating statistical insights or presenting relevant information to users, for instance, through visualizations like maps.

## Under the hood
The application operates through the following pipeline:
	1.	**Report Detection**: A listener runs on an Elastic Cloud Compute (EC2) instance to monitor incoming reports via Telegram.
	2.	**Message Filtering**: Upon receiving a report, the EC2 instance triggers an AWS Lambda function. This function leverages a trained Large Language Model (LLM) to determine whether the report is relevant.
	3.	**Classification and Storage**: If deemed relevant, the message is passed to a classifier that utilizes the Levenshtein distance algorithm to refine its categorization. The processed data is then stored in a SQL database for further use.
 
#### The Pipeline 
<img width="369" alt="image" src="https://github.com/user-attachments/assets/4840636d-1a45-4385-bde6-13d041779275">



