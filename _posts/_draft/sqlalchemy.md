Explicit joins in SQLAlchemy! What this means is that we are showing what the join conditions are within the ORM query itself, rather than built into your model classes.

Here's the ORM query with explicit joins:

    join_results = (
        db.session.query(TableA).filter_by(table_a_col=some_var)
            .join(TableB, TableB.table_a_id == TableA.id)
            .all()
    )