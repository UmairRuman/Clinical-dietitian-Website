-- display_name is the PUBLIC label (already shortened/anonymised per the visitor's choice).
-- real_name keeps what the visitor typed; it is never exposed by the public view.
alter table submissions add column if not exists real_name text;
update submissions set real_name = display_name where real_name is null;
alter table submissions alter column real_name set not null;

alter table booking_requests add column if not exists email text;
