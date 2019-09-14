---
layout: default
title:  Python – Relational Database Migrations using Flask-Migrate 
date:   2019-04-27 20:18:00 +0100
category: Dev
---


## Introduction
In this blog post, I`ll show how to use the Flask-Migrate module to simplify database schema changes for a Flask web application that is using SQLAlchemy. The Flask-Migrate module is written by [Miguel Grinberg](https://blog.miguelgrinberg.com/index) and utilizes the Alembic module for changing the database schema (ie. performing database migrations). Flask-Migrate provides a convenient command-line interface for performing database migrations, including versioning of the database schema.

One of the more challenging aspects of working with relational databases is making changes to the database schema, such as adding or deleting columns. During the early development of an application, making changes to a table in a relational database is easy if you`re not worried about deleting all of the data in your database. However, once you get into production and are actually storing real data in your relational database, you need to be very cautious when changing a table. While relational databases have a lot of strong points, being able to easily update the underlying schema of a database table is not one of them.

To be explicit, the use of the Flask-Migrate module is intended for Flask applications that are using SQLAlchemy as the ORM (Object-Relational Mapper) for interfacing with the underlying database. Typically, using a PostgreSQL database is a good choice for a Flask application and SQLAlchemy is a great tool for allowing you to work in terms of python instead of SQL for interfacing with the database.

#### Why is a database migration tool needed ?
At first, it may seem like having a tool for doing database migrations is overkill. It very well may be for a simple application, but I`d argue that any application that is going into production (where there is real data being stored) should utilize a database migration tool.

Let's take a simple example to show how a database migration tool (such as Flask-Migrate) can be beneficial… Suppose you have a web application with a mature database schema that you've pushed to production and there are a few users already using your application. As part of a new feature, you want to add the ability to have users be part of groups, so you need to update your database schema to allow users to be associated with groups. While this is a change that you can test out in your development environment with test data, it`s a significant change for your production database as you must ensure that you are not going to delete or alter any existing data. At this point, you could write a script to perform this database migration. OK, not a huge deal to write a single script. How about if you have to make three database migrations in two weeks or 7 each week, writing new scripts every time becomes quite tedious. So why not use a tool that was developed just for this purpose and has been tested out thoroughly?

#### Configuring Flask-Migrate
The first step is to install the Flask-Migrate module using pip and then update your listing of modules
```bash
pip install Flask-Migrate
pip freeze > requirements.txt
```

If you look at the Flask-Migrate documentation, there are two ways for utilizing this module:

1. Including Flask-Migrate directly into your application
1. Creating a separate script for handling database migrations

Both methods is good, but I prefer the first one due to the simplicity. 
To utilize Flask-Migrate, you`ll need to update the configuration of your Flask application by adding the following lines to the __init__.py file in …/web/ (source code is truncated to just show the updates):

```python
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_pagedown import PageDown
from flask_migrate import Migrate

app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('flask.cfg')
 
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
pagedown = PageDown(app)
migrate = Migrate(app, db)
```

You now have the ability to control the database migrations using the command-line interface.

#### Setting Up Versioning of the Database Schema
Before starting this section, make sure that you have the FLASK_APP environment variable set to your top-level python file for running your Flask application:

```bash
export FLASK_APP=run.py
```

This will allow you to use the format `flask …` from the command line instead of `python run.py …`. This may seem like trivial change, but it`s the recommended method for running a Flask application.

After configuring Flask-Migrate, you should create a migration repository (it will be created in …/web/migrations/) for storing the different versions of your database schema:

```bash
flask db init
  Creating directory .../flask_recipe_app/web/migrations ... done
  Creating directory .../flask_recipe_app/web/migrations/versions ... done
  Generating .../flask_recipe_app/web/migrations/alembic.ini ... done
  Generating .../flask_recipe_app/web/migrations/env.py ... done
  Generating .../flask_recipe_app/web/migrations/README ... done
  Generating .../flask_recipe_app/web/migrations/script.py.mako ... done
  Please edit configuration/connection/logging settings in '.../flask_recipe_app/web/migrations/alembic.ini' before proceeding.
```
Now that you have a versioning system for your database schema, it`s a good time to add it to your overall version control system (ie. git repository):

```bash
git status
git add .
git commit -m "Adding initial version of database schema versioning"
git push origin master
```

Making a Change to the Database Schema
This example will be a simple update to the database schema, but it will illustrate all the steps to follow when making changes to a database schema. The database schema is defined in …/web/models.py and we`re adding the following element to the posts table:

```python
class Post(db.Model):
    __tablename__ = "posts"
 
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    tag = db.Column(db.String, default=None, nullable=True) # It was add as a new column
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
```

After you`re satisfied with the change to the database schema, generate the initial migration:

```bash
flask db migrate -m "Added tag field to post table"
```

This command will generate a script for performing the database upgrade. I really like including a message for each change to the database schema, as this really helps to reinforce the similarities to a version control system like git.

It's a good idea to review the script to make sure it`s doing what you intended… look at …/web/migrations/versions/*_added_tag_field*.py:

```python
"""Added tag field to post table
 
Revision ID: 56b6764ae94a
Revises: None
Create Date: 2018-03-17 22:40:30.168097
 
"""
 
# revision identifiers, used by Alembic.
revision = '56b6764ae94a'
down_revision = None
 
from alembic import op
import sqlalchemy as sa
 
 
def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('posts', sa.Column('tag', sa.String(), nullable=True))
    ### end Alembic commands ###
 
 
def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('posts', 'tag')
    ### end Alembic commands ###
```

You can see in the script that the command to upgrade the database schema will add the tag field, while the command to downgrade the database schema will drop the tag field. Once you are happy with the script contents, you can apply the upgrade to the database schema:

```bash
flask db upgrade
```

Now that the changes to the database schema have been applied, add the changes to your git repository:

```bash
$ git status
$ git add .
$ git commit -m “Updated database schema to add ???? to the recipe table”
$ git push origin master
```

This is the typically flow that you`ll want to follow as you make updates to your database:

1. Make an update to your database schema (in your development environment) and test it out 
1. `flask db migrate -m` 
1. `Check the migration script`
1. `flask db upgrade`
1. Commit to the changes to your git repository

#### Updating the Database Schema in Production
Once you`re happy with the changes to your database schema and the changes have been pushed up to your git repository (I prefer GitLab), head over to your production server and execute the following commands if you are using Docker and Docker-Compose:

```bash
git pull origin master
docker-compose stop
docker-compose build
docker-compose up -d
sudo docker-compose run --rm web bash
    > export FLASK_APP=run.py
    > flask db upgrade
    > exit
```

You should now see that your production database has been upgraded to include the new field in the posts table and that all of the existing data is still intact.

#### Additional Helpful Commands

1. `flask db history`: If you want to be able to see all of the database schema migrations
1. `flask db current --verbose`: If you want to see the current version of the database schema
1. `flask db --help`: If you want to see a list of commands that you can use with Flask-Migrate:

#### Conclusion
This blog post showed how to simplify the process of making database schema changes using the Flask-Migrate module. I highly recommend using this module for any Flask application that is using SQLAlchemy. After a few configuration steps, Flask-Migrate allows you to easily make changes to your database schema using the following steps:

1. Make an update to your database schema (in your development environment) and test it out
1. `flask db migrate -m`
1. Check the migration script
1. `flask db upgrade`
1. Commit to the changes to your git repository

All of the source code from this blog post can be found on GitLab.
The Flask-Migrate module was written by [Miguel Grinberg](https://blog.miguelgrinberg.com/index). He has been a huge tag to me in terms of learning about Flask, so I highly recommend his Flask Mega-Tutorial and his excellent book on Flask web development: Flask Web Development.

