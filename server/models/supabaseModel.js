import { supabase } from "../config/db.js";

/**
 * ============================================================
 * FIELD MAPPING
 * ============================================================
 */

const FIELD_MAP = {
    _id: "id",
    createdAt: "created_at",
    updatedAt: "updated_at",
    filePlanned: "filePlanned",
    filesGenerated: "filesGenerated",
    currentFile: "currentFile",
};

function toColumnName(field) {
    return FIELD_MAP[field] || field;
}


/**
 * ============================================================
 * DATABASE ROW -> APPLICATION DOCUMENT
 * ============================================================
 */

function fromRow(row) {
    if (!row) return null;

    const document = { ...row };

    // Mongo/Mongoose-style compatibility
    document._id = document.id;

    delete document.id;

    // Convert timestamps
    document.createdAt = document.created_at;
    document.updatedAt = document.updated_at;

    delete document.created_at;
    delete document.updated_at;

    return document;
}


/**
 * ============================================================
 * APPLICATION DOCUMENT -> DATABASE ROW
 * ============================================================
 */

function toRow(document = {}) {
    const row = { ...document };

    // Remove Mongo-style ID
    delete row._id;

    // Convert camelCase timestamps
    if (row.createdAt !== undefined) {
        row.created_at = row.createdAt;
    }

    if (row.updatedAt !== undefined) {
        row.updated_at = row.updatedAt;
    }

    delete row.createdAt;
    delete row.updatedAt;

    // Remove Mongo operators
    delete row.$push;
    delete row.$set;
    delete row.$unset;

    return row;
}


/**
 * ============================================================
 * FILTER CONVERSION
 * ============================================================
 */

function normalizeFilters(filters = {}) {
    const result = {};

    for (const [field, value] of Object.entries(filters)) {
        result[toColumnName(field)] = value;
    }

    return result;
}


/**
 * ============================================================
 * FIELD PROJECTION
 * ============================================================
 *
 * Supports:
 *
 * select("name email")
 *
 * select("-password")
 *
 * ============================================================
 */

function projectFields(document, selection) {
    if (!selection || selection === "*") {
        return document;
    }

    const fields = selection
        .split(/\s+/)
        .filter(Boolean);

    const excluded = fields
        .filter((field) => field.startsWith("-"))
        .map((field) => field.slice(1));

    // Exclusion projection
    if (excluded.length) {
        const result = { ...document };

        excluded.forEach((field) => {
            delete result[field];
        });

        return result;
    }

    // Inclusion projection
    return Object.fromEntries(
        fields
            .filter((field) => document[field] !== undefined)
            .map((field) => [field, document[field]])
    );
}


/**
 * ============================================================
 * QUERY CLASS
 * ============================================================
 */

class SupabaseQuery {
    constructor(executor) {
        this.executor = executor;
        this.selection = null;
        this.sortSpec = null;
    }

    select(selection) {
        this.selection = selection;
        return this;
    }

    sort(sortSpec) {
        this.sortSpec = sortSpec;
        return this;
    }

    async execute() {
        return this.executor(this);
    }

    then(resolve, reject) {
        return this.execute().then(resolve, reject);
    }

    catch(reject) {
        return this.execute().catch(reject);
    }
}


/**
 * ============================================================
 * SUPABASE MODEL
 * ============================================================
 */

export class SupabaseModel {

    static table;


    /**
     * ========================================================
     * CREATE
     * ========================================================
     */

    static async create(values) {
        const row = toRow(values);

        const {
            data,
            error
        } = await supabase
            .from(this.table)
            .insert(row)
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return this.hydrate(data);
    }


    /**
     * ========================================================
     * FIND
     * ========================================================
     *
     * Example:
     *
     * User.find({ email })
     *
     * Project.find({ owner: userId })
     *
     * ========================================================
     */

    static find(filters = {}, projection) {
        return new SupabaseQuery(async (query) => {

            let request = supabase
                .from(this.table)
                .select("*");


            // Apply filters
            for (const [field, value] of Object.entries(filters)) {

                const column = toColumnName(field);

                request = request.eq(column, value);
            }


            // Apply sorting
            if (query.sortSpec) {

                for (const [field, direction] of Object.entries(
                    query.sortSpec
                )) {

                    const column = toColumnName(field);

                    request = request.order(
                        column,
                        {
                            ascending: direction !== -1,
                        }
                    );
                }
            }


            const {
                data,
                error
            } = await request;


            if (error) {
                throw error;
            }


            const documents = (data || []).map((row) => {

                const document = fromRow(row);

                return projectFields(
                    document,
                    query.selection || projection
                );
            });


            return documents;
        });
    }


    /**
     * ========================================================
     * FIND ONE
     * ========================================================
     */

    static findOne(filters = {}) {
        return new SupabaseQuery(async (query) => {

            let request = supabase
                .from(this.table)
                .select("*");


            // Apply filters
            for (const [field, value] of Object.entries(filters)) {

                const column = toColumnName(field);

                request = request.eq(column, value);
            }


            // Only get one row
            request = request.limit(1);


            const {
                data,
                error
            } = await request;


            if (error) {
                throw error;
            }


            if (!data || data.length === 0) {
                return null;
            }


            const document = fromRow(data[0]);


            // If projection requested,
            // return a plain object.
            if (query.selection) {

                return projectFields(
                    document,
                    query.selection
                );
            }


            return this.hydrate(data[0]);
        });
    }


    /**
     * ========================================================
     * FIND BY ID
     * ========================================================
     */

    static findById(id) {
        return this.findOne({
            _id: id,
        });
    }


    /**
     * ========================================================
     * FIND BY ID AND UPDATE
     * ========================================================
     */

    static findByIdAndUpdate(
        id,
        updates,
        options = {}
    ) {
        return this.findOneAndUpdate(
            {
                _id: id,
            },
            updates,
            options
        );
    }


    /**
     * ========================================================
     * FIND ONE AND UPDATE
     * ========================================================
     *
     * Supports:
     *
     * {
     *   name: "New Name"
     * }
     *
     * and:
     *
     * {
     *   $push: {
     *      messages: message
     *   }
     * }
     *
     * ========================================================
     */

    static findOneAndUpdate(
        filters,
        updates,
        options = {}
    ) {

        return new SupabaseQuery(async () => {

            const current = await this
                .findOne(filters)
                .execute();


            if (!current) {
                return null;
            }


            const changes = {};


            // ------------------------------------------------
            // Normal updates
            // ------------------------------------------------

            for (const [field, value] of Object.entries(updates)) {

                if (
                    field !== "$push" &&
                    field !== "$set" &&
                    field !== "$unset"
                ) {

                    changes[field] = value;
                }
            }


            // ------------------------------------------------
            // $set
            // ------------------------------------------------

            if (updates.$set) {

                Object.assign(
                    changes,
                    updates.$set
                );
            }


            // ------------------------------------------------
            // $push
            // ------------------------------------------------

            if (updates.$push) {

                for (
                    const [field, value]
                    of Object.entries(updates.$push)
                ) {

                    const existingValue =
                        current[field];

                    const currentArray =
                        Array.isArray(existingValue)
                            ? existingValue
                            : [];


                    changes[field] = [
                        ...currentArray,
                        value,
                    ];
                }
            }


            // ------------------------------------------------
            // $unset
            // ------------------------------------------------

            if (updates.$unset) {

                for (
                    const field
                    of Object.keys(updates.$unset)
                ) {

                    changes[field] = null;
                }
            }


            const updated =
                await this.updateDocument(
                    current,
                    changes
                );


            // Mongoose-style compatibility
            if (options.new === false) {
                return current;
            }


            return updated;
        });
    }


    /**
     * ========================================================
     * FIND ONE AND DELETE
     * ========================================================
     */

    static findOneAndDelete(filters = {}) {

        return new SupabaseQuery(async () => {

            const current = await this
                .findOne(filters)
                .execute();


            if (!current) {
                return null;
            }


            const {
                error
            } = await supabase
                .from(this.table)
                .delete()
                .eq("id", current._id);


            if (error) {
                throw error;
            }


            return current;
        });
    }


    /**
     * ========================================================
     * UPDATE DOCUMENT
     * ========================================================
     */

    static async updateDocument(
        document,
        changes
    ) {

        const row = toRow(changes);


        // The PostgreSQL trigger already updates updated_at.
        // Keeping this explicit also works if the trigger
        // is unavailable.
        row.updated_at =
            new Date().toISOString();


        const {
            data,
            error
        } = await supabase
            .from(this.table)
            .update(row)
            .eq("id", document._id)
            .select("*")
            .single();


        if (error) {
            throw error;
        }


        return this.hydrate(data);
    }


    /**
     * ========================================================
     * HYDRATE
     * ========================================================
     */

    static hydrate(row) {

        if (!row) {
            return null;
        }

        return new this(
            fromRow(row)
        );
    }


    /**
     * ========================================================
     * CONSTRUCTOR
     * ========================================================
     */

    constructor(values = {}) {

        Object.assign(
            this,
            values
        );
    }


    /**
     * ========================================================
     * MARK MODIFIED
     * ========================================================
     *
     * Kept for Mongoose compatibility.
     *
     * ========================================================
     */

    markModified() {}


    /**
     * ========================================================
     * SAVE
     * ========================================================
     */

    async save() {

        if (!this._id) {
            throw new Error(
                `${this.constructor.name}: Cannot save document without _id`
            );
        }


        const saved =
            await this.constructor.updateDocument(
                this,
                this
            );


        Object.assign(
            this,
            saved
        );


        return this;
    }
}