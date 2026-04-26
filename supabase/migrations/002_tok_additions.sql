-- Add title to exhibitions and justification to objects
alter table tok_exhibitions add column title text not null default 'Untitled Exhibition';
alter table tok_objects add column justification text;
alter table tok_objects add column position integer not null default 0;
